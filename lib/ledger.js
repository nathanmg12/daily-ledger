// Shared reads for a reader's ledger, used by today and the archive.

// How far back the archive goes. Deliberately bounded: an unbounded list turns
// into a scroll of editions you didn't read, which is the backlog guilt this
// app exists to avoid. It also keeps every query small by construction — 30
// days of feeds is roughly 480 rows, comfortably inside the API's 1000-row
// response cap, so the archive can never silently lose its oldest entries.
export const ARCHIVE_DAYS = 30

const CARD_SELECT = 'card_id, cards(id, type, title, content, card_interests(interests(name)))'

function shapeCards(rows) {
  return (rows || []).map((row) => {
    if (!row.cards) return null
    const interests = row.cards.card_interests?.map((ci) => ci.interests?.name).filter(Boolean) || []
    return { ...row.cards, interests }
  }).filter(Boolean)
}

export function toDateString(date) {
  return date.toISOString().split('T')[0]
}

export function formatLedgerDate(dateString) {
  // Parsed as UTC so a feed dated 2026-08-04 never renders as the 3rd for a
  // reader west of Greenwich.
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

// Which edition of this reader's ledger a given date is. Counts from their own
// first feed, so everyone starts at No. 001 on their first day.
export async function getEditionNumber(supabase, userId, currentDate) {
  const { data, error } = await supabase
    .from('daily_feed')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(1)

  if (error || !data?.length) return null

  const days = Math.floor(
    (new Date(`${currentDate}T00:00:00Z`) - new Date(`${data[0].date}T00:00:00Z`)) / 86400000
  )
  return days >= 0 ? days + 1 : null
}

export async function getFeedForDate(supabase, userId, date) {
  const { data, error } = await supabase
    .from('daily_feed')
    .select(CARD_SELECT)
    .eq('user_id', userId)
    .eq('date', date)

  if (error) throw new Error(error.message)
  return shapeCards(data)
}

// The reader's most recent feed, whatever date it carries. Falling back to the
// latest rather than requiring today means a failed generation run shows
// yesterday's ledger instead of an empty page.
export async function getLatestFeed(supabase, userId) {
  const { data: latest, error } = await supabase
    .from('daily_feed')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)

  if (error || !latest?.length) return { cards: [], date: null }

  const date = latest[0].date
  return { cards: await getFeedForDate(supabase, userId, date), date }
}

// Past editions, newest first, excluding the one currently being read.
export async function listRecentEditions(supabase, userId, { excludeDate = null } = {}) {
  const since = toDateString(new Date(Date.now() - ARCHIVE_DAYS * 86400000))

  const { data, error } = await supabase
    .from('daily_feed')
    .select('date, cards(type)')
    .eq('user_id', userId)
    .gte('date', since)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)

  // One row per card, so collapse to days. Bounded to ARCHIVE_DAYS, this stays
  // small enough that counting in JS costs nothing.
  const byDate = new Map()
  for (const row of data || []) {
    if (!row.date || row.date === excludeDate) continue
    if (!byDate.has(row.date)) byDate.set(row.date, { date: row.date, count: 0, types: new Set() })
    const entry = byDate.get(row.date)
    entry.count++
    if (row.cards?.type) entry.types.add(row.cards.type)
  }

  // Edition numbers use the same calendar maths as the hero, so the archive
  // and the page it links to always agree. The reader's first feed date is
  // fetched once and the numbers derived locally — asking per edition would
  // fire thirty queries to compute thirty subtractions.
  const { data: firstRow } = await supabase
    .from('daily_feed')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(1)

  const firstDate = firstRow?.[0]?.date
  const editionFor = (date) => {
    if (!firstDate) return null
    const days = Math.floor(
      (new Date(`${date}T00:00:00Z`) - new Date(`${firstDate}T00:00:00Z`)) / 86400000
    )
    return days >= 0 ? days + 1 : null
  }

  return [...byDate.values()].map((e) => ({
    date: e.date,
    count: e.count,
    types: [...e.types],
    edition: editionFor(e.date),
  }))
}
