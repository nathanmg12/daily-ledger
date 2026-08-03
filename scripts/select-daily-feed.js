const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// How many of each card type to select per user
const CARD_COUNTS = {
  scripture:    1,
  quote:        1,
  quick_facts:  2, // per followed interest
  book_summary: 2,
  food_spotlight: 1,
  protocol:     1,
  research:     2,
}

// Card types that are served once per user (not multiplied by interest count)
const GLOBAL_TYPES = ['book_summary', 'food_spotlight', 'protocol', 'research']

// Card types that multiply by interest count
const PER_INTEREST_TYPES = ['quick_facts']

// Card types gated by a specific interest slug
const INTEREST_GATED = {
  scripture: 'scripture-faith',
  quote:     'quotes-wisdom',
}

// A seen card becomes eligible to resurface after this many days
const REPEAT_COOLDOWN_DAYS = 45

async function getTodayString() {
  const now = new Date()
  return now.toISOString().split('T')[0] // YYYY-MM-DD
}

// Fisher-Yates. `sort(() => Math.random() - 0.5)` is not a uniform shuffle —
// comparison sorts assume a consistent comparator, and a random one leaves
// items biased toward their starting positions.
function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// PostgREST caps every response at 1000 rows and gives no signal when it
// truncates. A daily reader adds ~15 history rows a day, so the 45-day window
// reaches that cap in a couple of months — and a truncated history reads as
// "never seen", which quietly reintroduces cards the user just read. Page
// through explicitly. The order matters: without a stable sort, .range()
// windows can overlap or skip rows between requests.
async function fetchAllRows(buildQuery, orderColumn) {
  const PAGE_SIZE = 1000
  const rows = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery()
      .order(orderColumn, { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

async function getActiveUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .in('subscription_status', ['trial', 'active', 'early_access'])

  if (error) throw new Error(`Failed to fetch users: ${error.message}`)
  return data.map((u) => u.id)
}

async function getUserInterests(userId) {
  const { data, error } = await supabase
    .from('user_interests')
    .select('interest_id, interests(id, slug)')
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to fetch interests for user ${userId}: ${error.message}`)
  return data.map((row) => row.interests)
}

async function getSeenCardIds(userId) {
  const cooldownStart = new Date(Date.now() - REPEAT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString()

  try {
    const rows = await fetchAllRows(
      () => supabase
        .from('user_card_history')
        .select('card_id')
        .eq('user_id', userId)
        .gte('seen_at', cooldownStart),
      'card_id'
    )
    return rows.map((row) => row.card_id)
  } catch (err) {
    throw new Error(`Failed to fetch card history for user ${userId}: ${err.message}`)
  }
}

async function getSavedCardIds(userId) {
  try {
    const rows = await fetchAllRows(
      () => supabase
        .from('user_saved_cards')
        .select('card_id')
        .eq('user_id', userId),
      'card_id'
    )
    return rows.map((row) => row.card_id)
  } catch (err) {
    throw new Error(`Failed to fetch saved cards for user ${userId}: ${err.message}`)
  }
}

// `cards!inner` matters. With a plain embed, PostgREST applies `cards.type`
// to the embedded row only — the parent card_interests row still comes back
// with cards: null. That means the type filter does nothing server-side and
// the response burns its 1000-row cap on rows of every other type, so most
// of the pool is invisible. !inner turns it into a real inner join, so the
// filter restricts parent rows and each type returns its full pool.
async function getEligibleCards(interestIds, excludedCardIds, type, count) {
  const { data, error } = await supabase
    .from('card_interests')
    .select('card_id, cards!inner(id, type)')
    .in('interest_id', interestIds)
    .eq('cards.type', type)

  if (error) throw new Error(`Failed to fetch cards of type ${type}: ${error.message}`)

  // Deduplicate (same card can be tagged to multiple interests), then drop
  // excluded cards (seen within cooldown, or saved to library)
  const excluded = new Set(excludedCardIds)
  const eligible = [...new Set(data.map((row) => row.card_id))]
    .filter((id) => !excluded.has(id))

  return shuffle(eligible).slice(0, count)
}

async function selectFeedForUser(userId, today) {
  // Bail if this user already has a feed for today. Without this, a second run
  // (cron retry, manual dispatch, a local test) appends a whole second feed on
  // top of the first — the unique constraint doesn't catch it because the
  // shuffle picks different cards, so the user just gets a double-length day.
  const { data: existing, error: existingError } = await supabase
    .from('daily_feed')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .limit(1)

  if (existingError) {
    throw new Error(`Failed to check existing feed for user ${userId}: ${existingError.message}`)
  }
  if (existing.length) {
    console.log(`User ${userId} already has a feed for ${today} — skipping`)
    return { status: 'ok', count: 0 }
  }

  const interests = await getUserInterests(userId)

  // No interests means onboarding was never finished. That's a normal account
  // state, not a generation failure — skip it without raising an alert, or the
  // nightly run would fail forever on accounts that never picked topics.
  if (!interests.length) {
    console.log(`User ${userId} follows no interests — skipping`)
    return { status: 'skipped' }
  }

  const interestIds = interests.map((i) => i.id)
  const interestSlugs = interests.map((i) => i.slug)
  const [seenCardIds, savedCardIds] = await Promise.all([
    getSeenCardIds(userId),
    getSavedCardIds(userId),
  ])
  const excludedCardIds = [...new Set([...seenCardIds, ...savedCardIds])]

  const selectedCardIds = []

  // Scripture — only if user follows scripture-faith
  if (interestSlugs.includes('scripture-faith')) {
    const cards = await getEligibleCards(interestIds, excludedCardIds, 'scripture', CARD_COUNTS.scripture)
    selectedCardIds.push(...cards)
  }

  // Quote — only if user follows quotes-wisdom
  if (interestSlugs.includes('quotes-wisdom')) {
    const cards = await getEligibleCards(interestIds, excludedCardIds, 'quote', CARD_COUNTS.quote)
    selectedCardIds.push(...cards)
  }

  // Quick facts — 2 per followed interest
  for (const interest of interests) {
    const cards = await getEligibleCards([interest.id], excludedCardIds, 'quick_facts', CARD_COUNTS.quick_facts)
    selectedCardIds.push(...cards)
  }

  // Global types — pulled from all followed interests combined
  for (const type of GLOBAL_TYPES) {
    const count = CARD_COUNTS[type]
    const cards = await getEligibleCards(interestIds, excludedCardIds, type, count)
    selectedCardIds.push(...cards)
  }

  // This user follows interests but nothing came back. Either the pool is
  // exhausted or something is broken — worth an alert either way.
  if (selectedCardIds.length === 0) {
    console.log(`No cards selected for user ${userId}`)
    return { status: 'empty' }
  }

  // Dedupe before insert. daily_feed has UNIQUE (user_id, date, card_id), so a
  // single repeated id would reject the whole batch and leave this user with no
  // feed at all. upsert+ignoreDuplicates also makes a re-run idempotent rather
  // than a hard failure.
  const uniqueCardIds = [...new Set(selectedCardIds)]

  const rows = uniqueCardIds.map((card_id) => ({
    user_id: userId,
    card_id,
    date: today,
  }))

  const { error } = await supabase
    .from('daily_feed')
    .upsert(rows, { onConflict: 'user_id,date,card_id', ignoreDuplicates: true })

  if (error) throw new Error(`Failed to insert daily feed for user ${userId}: ${error.message}`)

  console.log(`Selected ${uniqueCardIds.length} cards for user ${userId}`)
  return { status: 'ok', count: uniqueCardIds.length }
}

async function main() {
  const today = await getTodayString()
  console.log(`Running feed selection for ${today}`)

  const userIds = await getActiveUsers()
  console.log(`Found ${userIds.length} active user(s)`)

  const failed = []
  const empty = []
  let ok = 0
  let skipped = 0

  for (const userId of userIds) {
    try {
      const result = await selectFeedForUser(userId, today)
      if (result.status === 'ok') ok++
      else if (result.status === 'skipped') skipped++
      else empty.push(userId)
    } catch (err) {
      console.error(`Error processing user ${userId}:`, err.message)
      failed.push({ userId, message: err.message })
      // Continue to next user rather than stopping the whole run
    }
  }

  console.log(
    `\nFeed selection complete — ${ok} ok, ${skipped} skipped (no interests), ` +
    `${empty.length} empty, ${failed.length} failed.`
  )

  // A user with an error or with zero cards has no usable feed today. Exit
  // non-zero so the run is marked failed and GitHub's notification fires;
  // otherwise a fully broken night looks identical to a healthy one.
  if (failed.length || empty.length) {
    console.error('\n=== FEED GENERATION FAILURES ===')
    for (const f of failed) {
      console.error(`ERROR  ${f.userId}: ${f.message}`)
    }
    for (const userId of empty) {
      console.error(`EMPTY  ${userId}: no cards selected`)
    }
    await writeJobSummary({ today, total: userIds.length, ok, skipped, empty, failed })
    process.exitCode = 1
    return
  }

  await writeJobSummary({ today, total: userIds.length, ok, skipped, empty, failed })
}

// Surfaces the outcome in the GitHub Actions run summary, which is what shows
// up in the failure email rather than making you dig through raw logs.
async function writeJobSummary({ today, total, ok, skipped, empty, failed }) {
  const path = process.env.GITHUB_STEP_SUMMARY
  if (!path) return

  const lines = [
    `## Daily feed selection — ${today}`,
    '',
    `- Users processed: **${total}**`,
    `- Succeeded: **${ok}**`,
    `- Skipped (no interests): **${skipped}**`,
    `- Empty feeds: **${empty.length}**`,
    `- Errors: **${failed.length}**`,
  ]

  if (failed.length) {
    lines.push('', '### Errors', '')
    failed.forEach((f) => lines.push(`- \`${f.userId}\` — ${f.message}`))
  }
  if (empty.length) {
    lines.push('', '### Empty feeds (no cards selected)', '')
    empty.forEach((userId) => lines.push(`- \`${userId}\``))
  }

  try {
    await require('fs').promises.appendFile(path, lines.join('\n') + '\n')
  } catch (err) {
    console.error('Could not write job summary:', err.message)
  }
}

main().catch((err) => {
  console.error('Feed selection run failed:', err.message)
  process.exitCode = 1
})