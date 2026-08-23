import '../../today/today.css'
import '../ledger.css'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import ReadingProgress from '@/components/ReadingProgress'
import LedgerFeed from '@/components/LedgerFeed'
import {
  ARCHIVE_DAYS, formatLedgerDate, getEditionNumber, getFeedForDate,
  groupCardsByType, toDateString,
} from '@/lib/ledger'

export const metadata = { title: 'Past ledger' }

function isWithinArchive(date) {
  const oldest = toDateString(new Date(Date.now() - ARCHIVE_DAYS * 86400000))
  return date >= oldest && date <= toDateString(new Date())
}

export default async function ArchivedLedger({ params }) {
  const { date } = await params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect('/ledger')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Out-of-window dates go back to the index rather than rendering an empty
  // page that looks like the edition was lost.
  if (!isWithinArchive(date)) redirect('/ledger')

  let cards = []
  let edition = null
  let savedCardIds = new Set()

  try {
    const [feed, editionNo, savedData] = await Promise.all([
      getFeedForDate(supabase, user.id, date),
      getEditionNumber(supabase, user.id, date),
      supabase.from('user_saved_cards').select('card_id').eq('user_id', user.id),
    ])
    cards = feed
    edition = editionNo
    savedCardIds = new Set(savedData.data?.map((r) => r.card_id) || [])
  } catch (e) {
    console.error('Archived ledger error:', e.message)
  }

  // Deliberately no markCardsSeen here. That refreshes seen_at on every render,
  // so reading an old edition would push those cards' 45-day cooldowns forward
  // and shrink the pool the selector can draw from. The archive is for
  // re-reading; it must not change what tomorrow looks like.

  if (cards.length === 0) redirect('/ledger')

  const dateLabel = formatLedgerDate(date)
  const presentCardTypes = Object.keys(groupCardsByType(cards))

  return (
    <>
      <Nav presentCardTypes={presentCardTypes} />
      <ReadingProgress />
      <div className="tdl-page">
        <a href="/ledger" className="tdl-archive-back">← Past ledgers</a>

        <div className="tdl-hero">
          <div className="tdl-hero-top">
            <h1 className="tdl-hero-title">
              The Daily<br /><em>Ledger</em>
            </h1>
            <div className="tdl-hero-edition">
              {edition && (
                <span className="tdl-hero-edition-num">
                  No. {String(edition).padStart(3, '0')}
                </span>
              )}
              <span className="tdl-hero-edition-date">{dateLabel}</span>
            </div>
          </div>
          <div className="tdl-stats-row">
            <div className="tdl-stat">
              <span className="tdl-stat-num">{cards.length}</span>
              <span className="tdl-stat-label">Cards</span>
            </div>
            <div className="tdl-stat-divider" />
            <div className="tdl-stat">
              <span className="tdl-stat-num">~{Math.max(3, Math.round(cards.length * 1.2))}</span>
              <span className="tdl-stat-label">Min read</span>
            </div>
          </div>
        </div>

        <LedgerFeed
          cards={cards}
          savedCardIds={savedCardIds}
          userId={user.id}
          edition={edition}
          dateLabel={dateLabel}
          isArchive
        />
      </div>
    </>
  )
}
