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

async function getTodayString() {
  const now = new Date()
  return now.toISOString().split('T')[0] // YYYY-MM-DD
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
  const { data, error } = await supabase
    .from('user_card_history')
    .select('card_id')
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to fetch card history for user ${userId}: ${error.message}`)
  return data.map((row) => row.card_id)
}

async function getEligibleCards(interestIds, seenCardIds, type, count) {
  let query = supabase
    .from('card_interests')
    .select('card_id, cards(id, type)')
    .in('interest_id', interestIds)
    .eq('cards.type', type)

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch cards of type ${type}: ${error.message}`)

  // Filter out already seen cards and nulls (type mismatch)
  const eligible = data
    .filter((row) => row.cards && !seenCardIds.includes(row.card_id))
    .map((row) => row.card_id)

  // Deduplicate (same card can be tagged to multiple interests)
  const unique = [...new Set(eligible)]

  // Shuffle and pick
  const shuffled = unique.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

async function selectFeedForUser(userId, today) {
  const interests = await getUserInterests(userId)
  const interestIds = interests.map((i) => i.id)
  const interestSlugs = interests.map((i) => i.slug)
  const seenCardIds = await getSeenCardIds(userId)

  const selectedCardIds = []

  // Scripture — only if user follows scripture-faith
  if (interestSlugs.includes('scripture-faith')) {
    const cards = await getEligibleCards(interestIds, seenCardIds, 'scripture', CARD_COUNTS.scripture)
    selectedCardIds.push(...cards)
  }

  // Quote — only if user follows quotes-wisdom
  if (interestSlugs.includes('quotes-wisdom')) {
    const cards = await getEligibleCards(interestIds, seenCardIds, 'quote', CARD_COUNTS.quote)
    selectedCardIds.push(...cards)
  }

  // Quick facts — 2 per followed interest
  for (const interest of interests) {
    const cards = await getEligibleCards([interest.id], seenCardIds, 'quick_facts', CARD_COUNTS.quick_facts)
    selectedCardIds.push(...cards)
  }

  // Global types — pulled from all followed interests combined
  for (const type of GLOBAL_TYPES) {
    const count = CARD_COUNTS[type]
    const cards = await getEligibleCards(interestIds, seenCardIds, type, count)
    selectedCardIds.push(...cards)
  }

  if (selectedCardIds.length === 0) {
    console.log(`No cards selected for user ${userId} — skipping`)
    return
  }

  // Insert into daily_feed
  const rows = selectedCardIds.map((card_id) => ({
    user_id: userId,
    card_id,
    date: today,
  }))

  const { error } = await supabase.from('daily_feed').insert(rows)
  if (error) throw new Error(`Failed to insert daily feed for user ${userId}: ${error.message}`)

  console.log(`Selected ${selectedCardIds.length} cards for user ${userId}`)
}

async function main() {
  const today = await getTodayString()
  console.log(`Running feed selection for ${today}`)

  const userIds = await getActiveUsers()
  console.log(`Found ${userIds.length} active user(s)`)

  for (const userId of userIds) {
    try {
      await selectFeedForUser(userId, today)
    } catch (err) {
      console.error(`Error processing user ${userId}:`, err.message)
      // Continue to next user rather than stopping the whole run
    }
  }

  console.log('Feed selection complete.')
}

main()