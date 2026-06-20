import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const CARD_COUNTS = {
  scripture:      1,
  quote:          1,
  quick_facts:    2,
  book_summary:   2,
  food_spotlight: 1,
  protocol:       1,
  research:       2,
}

const GLOBAL_TYPES = ['book_summary', 'food_spotlight', 'protocol', 'research']

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

async function getCardIdsByType(supabase, interestIds, type) {
  const { data: ciRows } = await supabase
    .from('card_interests')
    .select('card_id')
    .in('interest_id', interestIds)

  if (!ciRows?.length) return []

  const cardIds = [...new Set(ciRows.map((r) => r.card_id))]

  const { data: cards } = await supabase
    .from('cards')
    .select('id')
    .eq('type', type)
    .in('id', cardIds)

  return cards?.map((c) => c.id) || []
}

export async function POST(request) {
  try {
    // Get the user session using cookie-based client
    const cookieStore = await cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service key client for all database operations (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const today = new Date().toISOString().split('T')[0]

    // Check if feed already exists for today
    const { data: existing } = await supabase
      .from('daily_feed')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .limit(1)

    if (existing?.length > 0) {
      return Response.json({ message: 'Feed already exists for today' })
    }

    // Get user interests
    const { data: userInterests } = await supabase
      .from('user_interests')
      .select('interest_id, interests(id, slug)')
      .eq('user_id', user.id)

    if (!userInterests?.length) {
      return Response.json({ error: 'No interests found' }, { status: 400 })
    }

    const interests = userInterests.map((row) => row.interests).filter(Boolean)
    const interestIds = interests.map((i) => i.id)
    const interestSlugs = interests.map((i) => i.slug)

    // Get seen card IDs
    const { data: seen } = await supabase
      .from('user_card_history')
      .select('card_id')
      .eq('user_id', user.id)

    const seenCardIds = new Set(seen?.map((r) => r.card_id) || [])

    const selectedCardIds = []

    async function pick(interestSubset, type, count) {
      const eligible = await getCardIdsByType(supabase, interestSubset, type)
      const unseen = eligible.filter((id) => !seenCardIds.has(id))
      return shuffle(unseen).slice(0, count)
    }

    // Scripture — gated by interest
    if (interestSlugs.includes('scripture-faith')) {
      selectedCardIds.push(...await pick(interestIds, 'scripture', CARD_COUNTS.scripture))
    }

    // Quote — gated by interest
    if (interestSlugs.includes('quotes-wisdom')) {
      selectedCardIds.push(...await pick(interestIds, 'quote', CARD_COUNTS.quote))
    }

    // Quick facts — 2 per individual interest
    for (const interest of interests) {
      selectedCardIds.push(...await pick([interest.id], 'quick_facts', CARD_COUNTS.quick_facts))
    }

    // Global types — from all interests combined
    for (const type of GLOBAL_TYPES) {
      selectedCardIds.push(...await pick(interestIds, type, CARD_COUNTS[type]))
    }

    if (!selectedCardIds.length) {
      return Response.json({ error: 'No cards available' }, { status: 400 })
    }

    const uniqueCardIds = [...new Set(selectedCardIds)]

    const rows = uniqueCardIds.map((card_id) => ({
      user_id: user.id,
      card_id,
      date: today,
    }))

    const { error: insertError } = await supabase
      .from('daily_feed')
      .upsert(rows, { onConflict: 'user_id,date,card_id', ignoreDuplicates: true })

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json({ success: true, cards: uniqueCardIds.length })

  } catch (err) {
    console.error('Seed feed error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}