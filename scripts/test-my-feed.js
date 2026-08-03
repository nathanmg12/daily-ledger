const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const MY_USER_ID = 'a2d33b06-f807-46a3-854f-4edd0b6d5b34'

const CARD_COUNTS = {
  scripture: 1,
  quote: 1,
  quick_facts: 2, // per followed interest, then capped by QUICK_FACTS_DAILY_MAX
  book_summary: 1,
  food_spotlight: 1,
  protocol: 1,
  research: 1,
}

const QUICK_FACTS_DAILY_MAX = 10

const GLOBAL_TYPES = ['book_summary', 'food_spotlight', 'protocol', 'research']

// A seen card becomes eligible to resurface after this many days
const REPEAT_COOLDOWN_DAYS = 45

async function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

async function getUserInterests(userId) {
  const { data, error } = await supabase
    .from('user_interests')
    .select('interest_id, interests(id, slug)')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return data.map((row) => row.interests)
}

async function getSeenCardIds(userId) {
  const cooldownStart = new Date(Date.now() - REPEAT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('user_card_history')
    .select('card_id')
    .eq('user_id', userId)
    .gte('seen_at', cooldownStart)
  if (error) throw new Error(error.message)
  return data.map((row) => row.card_id)
}

async function getSavedCardIds(userId) {
  const { data, error } = await supabase
    .from('user_saved_cards')
    .select('card_id')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return data.map((row) => row.card_id)
}

function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// See select-daily-feed.js — `cards!inner` is required for the type filter to
// restrict parent rows instead of hitting the 1000-row cap first.
async function getEligibleCards(interestIds, excludedCardIds, type, count) {
  const { data, error } = await supabase
    .from('card_interests')
    .select('card_id, cards!inner(id, type)')
    .in('interest_id', interestIds)
    .eq('cards.type', type)
  if (error) throw new Error(error.message)

  const excluded = new Set(excludedCardIds)
  const eligible = [...new Set(data.map((row) => row.card_id))]
    .filter((id) => !excluded.has(id))
  return shuffle(eligible).slice(0, count)
}

async function run() {
  const today = await getTodayString()
  const interests = await getUserInterests(MY_USER_ID)
  const interestIds = interests.map((i) => i.id)
  const interestSlugs = interests.map((i) => i.slug)
  const [seenCardIds, savedCardIds] = await Promise.all([
    getSeenCardIds(MY_USER_ID),
    getSavedCardIds(MY_USER_ID),
  ])
  const excludedCardIds = [...new Set([...seenCardIds, ...savedCardIds])]

  const selectedCardIds = []

  if (interestSlugs.includes('scripture-faith')) {
    selectedCardIds.push(...await getEligibleCards(interestIds, excludedCardIds, 'scripture', CARD_COUNTS.scripture))
  }
  if (interestSlugs.includes('quotes-wisdom')) {
    selectedCardIds.push(...await getEligibleCards(interestIds, excludedCardIds, 'quote', CARD_COUNTS.quote))
  }
  const quickFactIds = []
  for (const interest of interests) {
    quickFactIds.push(...await getEligibleCards([interest.id], excludedCardIds, 'quick_facts', CARD_COUNTS.quick_facts))
  }
  selectedCardIds.push(...shuffle([...new Set(quickFactIds)]).slice(0, QUICK_FACTS_DAILY_MAX))
  for (const type of GLOBAL_TYPES) {
    selectedCardIds.push(...await getEligibleCards(interestIds, excludedCardIds, type, CARD_COUNTS[type]))
  }

  console.log(`Would select ${selectedCardIds.length} cards for today.`)
  console.log(selectedCardIds)

  // Delete today's existing feed rows for me only, then insert fresh
  await supabase.from('daily_feed').delete().eq('user_id', MY_USER_ID).eq('date', today)

  const rows = selectedCardIds.map((card_id) => ({ user_id: MY_USER_ID, card_id, date: today }))
  const { error } = await supabase.from('daily_feed').insert(rows)
  if (error) throw new Error(error.message)

  console.log(`Inserted ${selectedCardIds.length} cards into daily_feed for ${MY_USER_ID}.`)
}

run()