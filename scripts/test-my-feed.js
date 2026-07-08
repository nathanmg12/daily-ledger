const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const MY_USER_ID = 'a2d33b06-f807-46a3-854f-4edd0b6d5b34'

const CARD_COUNTS = {
  scripture: 1,
  quote: 1,
  quick_facts: 2,
  book_summary: 2,
  food_spotlight: 1,
  protocol: 1,
  research: 2,
}

const GLOBAL_TYPES = ['book_summary', 'food_spotlight', 'protocol', 'research']

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
  const { data, error } = await supabase
    .from('user_card_history')
    .select('card_id')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return data.map((row) => row.card_id)
}

async function getEligibleCards(interestIds, seenCardIds, type, count) {
  const { data, error } = await supabase
    .from('card_interests')
    .select('card_id, cards(id, type)')
    .in('interest_id', interestIds)
    .eq('cards.type', type)
  if (error) throw new Error(error.message)

  const eligible = data
    .filter((row) => row.cards && !seenCardIds.includes(row.card_id))
    .map((row) => row.card_id)
  const unique = [...new Set(eligible)]
  return unique.sort(() => Math.random() - 0.5).slice(0, count)
}

async function run() {
  const today = await getTodayString()
  const interests = await getUserInterests(MY_USER_ID)
  const interestIds = interests.map((i) => i.id)
  const interestSlugs = interests.map((i) => i.slug)
  const seenCardIds = await getSeenCardIds(MY_USER_ID)

  const selectedCardIds = []

  if (interestSlugs.includes('scripture-faith')) {
    selectedCardIds.push(...await getEligibleCards(interestIds, seenCardIds, 'scripture', CARD_COUNTS.scripture))
  }
  if (interestSlugs.includes('quotes-wisdom')) {
    selectedCardIds.push(...await getEligibleCards(interestIds, seenCardIds, 'quote', CARD_COUNTS.quote))
  }
  for (const interest of interests) {
    selectedCardIds.push(...await getEligibleCards([interest.id], seenCardIds, 'quick_facts', CARD_COUNTS.quick_facts))
  }
  for (const type of GLOBAL_TYPES) {
    selectedCardIds.push(...await getEligibleCards(interestIds, seenCardIds, type, CARD_COUNTS[type]))
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