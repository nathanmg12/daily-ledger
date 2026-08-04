const webpush = require('web-push')
const { createClient } = require('@supabase/supabase-js')

webpush.setVapidDetails(
  'mailto:admin@thedailyledger.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Roughly what a lock screen shows before truncating, minus the "13 cards. "
// prefix. Questions longer than this are passed over rather than cut off
// mid-sentence, which would waste the hook entirely.
const QUESTION_BUDGET = 95

// The body pairs a count with a question because they do different jobs. The
// count is a promise the ledger is small enough to read now; the question is
// the reason to bother. Both are drawn from data every reader has: quick facts
// are the only card type in every feed, and every one carries a search_prompt
// written as a natural-language question.
function buildBody(cards) {
  const count = cards.length
  const scale = `${count} card${count === 1 ? '' : 's'}.`

  const questions = cards
    .filter((card) => card.type === 'quick_facts')
    .map((card) => card.content?.search_prompt)
    .filter((q) => typeof q === 'string' && q.trim().length)
    .map((q) => q.trim())

  if (!questions.length) return `${scale} Your ledger is ready.`

  // Prefer a random question that fits, so the same reader isn't served the
  // shortest one every morning. Fall back to the shortest available when
  // nothing fits the budget.
  const fitting = questions.filter((q) => q.length <= QUESTION_BUDGET)
  const question = fitting.length
    ? fitting[Math.floor(Math.random() * fitting.length)]
    : questions.slice().sort((a, b) => a.length - b.length)[0]

  return `${scale} ${question}`
}

async function getEditionNumber(userId, currentDate) {
  const { data } = await supabase
    .from('daily_feed')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(1)

  if (!data?.length) return null

  const days = Math.floor(
    (new Date(currentDate + 'T00:00:00Z') - new Date(data[0].date + 'T00:00:00Z')) / 86400000
  )
  return days >= 0 ? days + 1 : null
}

async function getTodaysCards(userId, today) {
  const { data } = await supabase
    .from('daily_feed')
    .select('cards(type, content)')
    .eq('user_id', userId)
    .eq('date', today)

  return (data || []).map((row) => row.cards).filter(Boolean)
}

// A push endpoint returning 404 or 410 is permanently gone: the reader cleared
// site data or uninstalled. Keeping the row means retrying it every morning
// forever and counting a ghost as a subscriber.
async function dropDeadSubscription(id) {
  const { error } = await supabase.from('push_subscriptions').delete().eq('id', id)
  if (error) console.error(`  could not delete subscription ${id}: ${error.message}`)
}

async function sendNotifications() {
  const today = new Date().toISOString().split('T')[0]

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, subscription')

  if (error) {
    console.error('Error fetching subscriptions:', error.message)
    process.exitCode = 1
    return
  }

  // A reader can have several devices; build the payload once per reader.
  const byUser = new Map()
  for (const row of subscriptions) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, [])
    byUser.get(row.user_id).push(row)
  }

  console.log(`${subscriptions.length} subscription(s) across ${byUser.size} reader(s)`)

  let sent = 0
  let failed = 0
  let removed = 0
  let skipped = 0

  for (const [userId, rows] of byUser) {
    const cards = await getTodaysCards(userId, today)

    // No ledger today means nothing to announce. Staying quiet beats sending
    // someone to an empty page.
    if (!cards.length) {
      console.log(`skip ${userId}: no feed for ${today}`)
      skipped += rows.length
      continue
    }

    const edition = await getEditionNumber(userId, today)

    const payload = JSON.stringify({
      title: edition
        ? `The Daily Ledger · No. ${String(edition).padStart(3, '0')}`
        : 'The Daily Ledger',
      body: buildBody(cards),
    })

    for (const row of rows) {
      try {
        await webpush.sendNotification(row.subscription, payload)
        sent++
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await dropDeadSubscription(row.id)
          removed++
        } else {
          console.error(`send failed for ${userId}: ${err.statusCode || ''} ${err.message}`)
          failed++
        }
      }
    }
  }

  console.log(
    `\nDone. ${sent} sent, ${failed} failed, ${removed} dead subscription(s) removed, ${skipped} skipped.`
  )

  if (failed) process.exitCode = 1
}

sendNotifications().catch((err) => {
  console.error('Push run failed:', err.message)
  process.exitCode = 1
})
