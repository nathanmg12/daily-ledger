import '../today/today.css'
import './ledger.css'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import FadeIn from '@/components/FadeIn'
import { ARCHIVE_DAYS, formatLedgerDate, listRecentEditions } from '@/lib/ledger'

export const metadata = { title: 'Past ledgers' }

const TYPE_DOTS = {
  scripture: '#8a6a20', quote: '#b5823a', quick_facts: '#2a8a6e',
  book_summary: '#6b52a8', food_spotlight: '#a07030',
  research: '#2e6da4', protocol: '#3a7a3a',
}

export default async function LedgerArchive() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let editions = []
  try {
    editions = await listRecentEditions(supabase, user.id)
  } catch (e) {
    console.error('Archive error:', e.message)
  }

  return (
    <>
      <Nav />
      <div className="tdl-page">
        <div className="tdl-archive-head">
          <h1 className="tdl-archive-title">
            Past <em>ledgers</em>
          </h1>
          <p className="tdl-archive-sub">
            The last {ARCHIVE_DAYS} days. Older editions retire so this stays a place to catch up,
            not a backlog.
          </p>
        </div>

        {editions.length === 0 ? (
          <div className="tdl-archive-empty">
            <p className="tdl-archive-empty-title">Nothing behind you yet.</p>
            <p className="tdl-archive-empty-note">
              Past editions appear here from your second day onward.
            </p>
          </div>
        ) : (
          <div className="tdl-archive-list">
            {editions.map((e, i) => (
              <FadeIn key={e.date} delay={Math.min(i * 40, 240)}>
                <a href={`/ledger/${e.date}`} className="tdl-archive-row">
                  <span className="tdl-archive-no">
                    No. {String(e.edition ?? 1).padStart(3, '0')}
                  </span>
                  <span className="tdl-archive-date">{formatLedgerDate(e.date)}</span>
                  <span className="tdl-archive-dots" aria-hidden="true">
                    {e.types.map((t) => (
                      <i key={t} style={{ background: TYPE_DOTS[t] || 'var(--border-med)' }} />
                    ))}
                  </span>
                  <span className="tdl-archive-count">{e.count} cards</span>
                </a>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
