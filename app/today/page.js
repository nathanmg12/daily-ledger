import './today.css'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import FadeIn from '@/components/FadeIn'
import SaveShareButtons from '@/components/SaveShareButtons'
import PushNotificationPrompt from '@/components/PushNotificationPrompt'
import AddToHomeScreenPrompt from '@/components/AddToHomeScreenPrompt'
import ReadingProgress from '@/components/ReadingProgress'
import LedgerFeed from '@/components/LedgerFeed'
import { groupCardsByType, getEditionNumber, getLatestFeed } from '@/lib/ledger'

async function getUserTopicCount(supabase, userId) {
  const { data, error } = await supabase
    .from('user_interests')
    .select('interest_id')
    .eq('user_id', userId)

  if (error) return 0
  return data.length
}

async function markCardsSeen(supabase, userId, cards) {
  if (!cards.length) return
  const rows = cards.map((card) => ({
    user_id: userId,
    card_id: card.id,
    seen_at: new Date().toISOString(),
  }))
  await supabase
    .from('user_card_history')
    .upsert(rows, { onConflict: 'user_id,card_id' })
}

// Engagement tracking.
//
// Uses the service-role client rather than the cookie client because
// user_activity has RLS enabled with no policies — nothing gets in or out
// except via service role. This is deliberate: activity data should not be
// forgeable from the browser, including by Nathan.
//
// Writes two things:
//   1. user_activity — append-only, one row per user per day (PK enforces
//      idempotency, so 12 opens today = 1 row). This is the substrate for
//      DAU and retention cohorts, and it can be queried retroactively.
//   2. users.last_seen_at — overwritten each visit, for "who's gone dark".
//
// Day is pinned to America/New_York so day boundaries line up with the
// 4am ET feed cutover. en-CA gives YYYY-MM-DD, which is what date wants.
async function recordActivity(userId) {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!serviceKey) {
    console.error('Activity tracking skipped: SUPABASE_SERVICE_KEY is not set')
    return
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey
  )

  const day = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/New_York',
  })

  const [activityRes, lastSeenRes] = await Promise.all([
    admin
      .from('user_activity')
      .upsert(
        { user_id: userId, day },
        { onConflict: 'user_id,day', ignoreDuplicates: true }
      ),
    admin
      .from('users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', userId),
  ])

  if (activityRes.error) {
    console.error('Activity insert failed:', activityRes.error.message)
  }
  if (lastSeenRes.error) {
    console.error('last_seen_at update failed:', lastSeenRes.error.message)
  }
}


export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/New_York',
  })

  // Record the visit before anything else can fail.
  // A user who opens the app and hits a feed error still opened the app —
  // that is engagement data and should be captured either way.
  if (user) {
    try {
      await recordActivity(user.id)
    } catch (e) {
      console.error('Activity tracking error:', e.message)
    }
  }

  let cards = []
  let topicCount = 0
  let savedCardIds = new Set()
  let editionNumber = null
  try {
    const [feed, count, savedData] = await Promise.all([
      getLatestFeed(supabase, user.id),
      getUserTopicCount(supabase, user.id),
      supabase.from('user_saved_cards').select('card_id').eq('user_id', user.id),
    ])
    cards = feed.cards
    topicCount = count
    savedCardIds = new Set(savedData.data?.map(r => r.card_id) || [])

    if (feed.date) {
      editionNumber = await getEditionNumber(supabase, user.id, feed.date)
    }

    await markCardsSeen(supabase, user.id, cards)
  } catch (e) {
    console.error('Feed error:', e.message)
  }

  const grouped = groupCardsByType(cards)
  const presentCardTypes = Object.keys(grouped)
  const totalCards = cards.length
  const minRead = Math.max(3, Math.round(totalCards * 1.2))

  return (
    <>
      <Nav presentCardTypes={presentCardTypes} />
      {totalCards > 0 && <ReadingProgress />}
      <div className="tdl-page">

        {/* Hero */}
        <div className="tdl-hero">
          <div className="tdl-hero-top">
            <h1 className="tdl-hero-title">
              The Daily<br /><em>Ledger</em>
            </h1>
            <div className="tdl-hero-edition">
              {editionNumber && (
                <span className="tdl-hero-edition-num">
                  No. {String(editionNumber).padStart(3, '0')}
                </span>
              )}
              <span className="tdl-hero-edition-date">{dateStr}</span>
            </div>
          </div>
          {totalCards > 0 && (
            <div className="tdl-stats-row">
              <div className="tdl-stat">
                <span className="tdl-stat-num">{totalCards}</span>
                <span className="tdl-stat-label">Cards today</span>
              </div>
              <div className="tdl-stat-divider" />
              <div className="tdl-stat">
                <span className="tdl-stat-num">{topicCount}</span>
                <span className="tdl-stat-label">Topics</span>
              </div>
              <div className="tdl-stat-divider" />
              <div className="tdl-stat">
                <span className="tdl-stat-num">~{minRead}</span>
                <span className="tdl-stat-label">Min read</span>
              </div>
            </div>
          )}
        </div>

        {/* Add to home screen prompt — shows once for new users */}
<AddToHomeScreenPrompt />

{/* Push notification prompt — shows once for new users */}
<PushNotificationPrompt />

        <LedgerFeed
          cards={cards}
          savedCardIds={savedCardIds}
          userId={user.id}
          edition={editionNumber}
          dateLabel={dateStr}
        />
      </div>
    </>
  )
}