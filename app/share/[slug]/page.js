import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import ShareSaveButton from '@/components/ShareSaveButton'

// Same "build the client inline" note as app/api/share-link/route.js —
// see that file for why. Swap for your shared helper if you have one
// that's proven reliable for this kind of read.
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

async function getSessionUser() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* no-op — read-only check on a public page */ },
      },
    }
  )
  const { data: { user } } = await authClient.auth.getUser()
  return user
}

const ACCENT = {
  scripture:      '#8a6a20',
  quote:          '#b5823a',
  quick_facts:    '#2a8a6e',
  book_summary:   '#6b52a8',
  food_spotlight: '#a07030',
  research:       '#2e6da4',
  protocol:       '#3a7a3a',
}

const TYPE_LABELS = {
  scripture: 'Scripture', quote: 'Quote', quick_facts: 'Quick Fact',
  book_summary: 'Book Summary', food_spotlight: 'Food Spotlight',
  research: 'Research', protocol: 'Protocol',
}

// Card rendering matches the visual language used across the app
// (daily.html / components/cards) — reimplemented with inline styles
// here since this page is public and shouldn't depend on globals.css
// class names that only exist inside the authenticated app shell.
function SharedCard({ type, content: c }) {
  const color = ACCENT[type] || ACCENT.quote
  const boxStyle = {
    background: 'var(--surface)',
    border: '0.5px solid var(--border-med)',
    borderRadius: 10,
    padding: '1.75rem 2rem',
    borderLeft: `3px solid ${color}`,
  }
  const eyebrowStyle = {
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
    textTransform: 'uppercase', color, marginBottom: '0.85rem',
  }

  if (type === 'scripture') {
    return (
      <div style={boxStyle}>
        <div style={eyebrowStyle}>Scripture</div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 21, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.55, marginBottom: 12 }}>
          &ldquo;{c.verse}&rdquo;
        </p>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color, marginBottom: 12 }}>{c.reference} · {c.translation}</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.context}</p>
      </div>
    )
  }

  if (type === 'quote') {
    return (
      <div style={boxStyle}>
        <div style={eyebrowStyle}>Quote</div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 21, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.55, marginBottom: 12 }}>
          &ldquo;{c.quote}&rdquo;
        </p>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color, marginBottom: 12 }}>
          — {c.author}{c.source ? ` · ${c.source}` : ''}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.context}</p>
      </div>
    )
  }

  if (type === 'quick_facts') {
    return (
      <div style={boxStyle}>
        <div style={eyebrowStyle}>Quick Fact</div>
        <p style={{ fontSize: 16, color: 'var(--text)', lineHeight: 1.7 }}>{c.fact}</p>
      </div>
    )
  }

  if (type === 'book_summary') {
    return (
      <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem 1.5rem', borderBottom: '0.5px solid var(--border)', alignItems: 'flex-start' }}>
          <div style={{ width: 50, minWidth: 50, height: 68, borderRadius: 5, background: 'rgba(107,82,168,0.08)', border: '0.5px solid rgba(107,82,168,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {c.cover_emoji || '📚'}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', marginBottom: 3 }}>{c.title}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>{c.author}</div>
          </div>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {c.ideas?.length} ideas from this book
          </div>
          {c.ideas?.map((idea, i) => (
            <div key={i} style={{ padding: '0.875rem 0', borderBottom: i < c.ideas.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color, marginBottom: 4 }}>{String(i + 1).padStart(2, '0')} /</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: '0.35rem' }}>{idea.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{idea.body}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'food_spotlight') {
    return (
      <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'rgba(160,112,48,0.08)', padding: '1.125rem 1.5rem', borderBottom: '0.5px solid rgba(160,112,48,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--text)' }}>{c.name}</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(c.badges || []).map((b) => (
              <span key={b} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 3, background: 'rgba(138,106,32,0.12)', color: '#8a6a20', border: '0.5px solid rgba(138,106,32,0.25)' }}>
                {b}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{c.intro}</p>
          {c.bottom_line && (
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a07030', marginBottom: 4 }}>Bottom line</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.bottom_line}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (type === 'research') {
    return (
      <div style={boxStyle}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color, marginBottom: '0.5rem' }}>
          {c.journal}{c.published_at ? ` · Published ${c.published_at}` : ''}
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{c.title}</div>
        <span style={{ display: 'inline-block', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color, marginBottom: '0.35rem' }}>TL;DR</span>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: c.takeaway ? '0.875rem' : 0 }}>{c.tldr}</div>
        {c.takeaway && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', borderLeft: '2px solid var(--border-med)', paddingLeft: '0.75rem', fontStyle: 'italic' }}>
            {c.takeaway}
          </div>
        )}
      </div>
    )
  }

  if (type === 'protocol') {
    return (
      <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'rgba(58,122,58,0.08)', padding: '1.125rem 1.5rem', borderBottom: '0.5px solid rgba(58,122,58,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 21, color: 'var(--text)' }}>{c.name}</div>
          {c.evidence_level && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a7a3a', background: 'rgba(58,122,58,0.1)', border: '0.5px solid rgba(58,122,58,0.25)', padding: '4px 10px', borderRadius: 3 }}>
              {c.evidence_level}
            </span>
          )}
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: c.how_to_start ? '1.25rem' : 0 }}>{c.overview}</p>
          {c.how_to_start && (
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a7a3a', marginBottom: 4 }}>How to start tomorrow</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.how_to_start}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default async function SharePage({ params }) {
  const { slug } = await params
  const service = getServiceClient()

  const { data: shareRow } = await service
    .from('shared_cards')
    .select('id, card_id, view_count')
    .eq('slug', slug)
    .maybeSingle()

  if (!shareRow) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--text)' }}>This link doesn&apos;t exist</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>It may have been removed, or the link was typed incorrectly.</p>
        <a href="/" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)' }}>Go to thedailyledger.app →</a>
      </div>
    )
  }

  const { data: card } = await service
    .from('cards')
    .select('id, type, content')
    .eq('id', shareRow.card_id)
    .maybeSingle()

  // Fire-and-forget view count increment — don't block the render on it.
  service
    .from('shared_cards')
    .update({ view_count: (shareRow.view_count || 0) + 1 })
    .eq('id', shareRow.id)
    .then(() => {})

  const user = await getSessionUser()
  let alreadySaved = false
  if (user && card) {
    const { data: savedRow } = await service
      .from('user_saved_cards')
      .select('card_id')
      .eq('user_id', user.id)
      .eq('card_id', card.id)
      .maybeSingle()
    alreadySaved = !!savedRow
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header — matches components/Nav.js: 52px sticky bar, brand mark,
          "The Daily" in text color + italic "Ledger" in accent. */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(240,237,232,0.97)',
        backdropFilter: 'blur(10px)',
        borderBottom: '0.5px solid var(--border-med)',
        padding: '0 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--text)', lineHeight: 1 }}>
          The Daily <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Ledger</em>
        </div>
        {!user && (
          <a
            href="/signup"
            style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: 'var(--text-secondary)',
              border: '0.5px solid var(--border-med)', borderRadius: 99,
              padding: '6px 14px', textDecoration: 'none',
            }}
          >
            Sign Up Today
          </a>
        )}
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '2.5rem 1.5rem 1.5rem' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          Shared From The Daily Ledger
        </div>

        {card ? (
          <div style={{ marginBottom: '2rem' }}>
            <SharedCard type={card.type} content={card.content} />
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>This card is no longer available.</p>
        )}

        <div style={{
          background: 'var(--surface)', border: '0.5px solid var(--border-med)',
          borderRadius: 10, padding: '1.75rem', textAlign: 'center',
        }}>
          {user ? (
            <>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 19, marginBottom: '0.5rem', color: 'var(--text)' }}>
                Add This To Your Library
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Save it now and revisit it anytime.
              </div>
              {card && (
                <ShareSaveButton cardId={card.id} userId={user.id} initiallySaved={alreadySaved} />
              )}
              <a
                href="/today"
                style={{
                  display: 'block', marginTop: '0.9rem', fontFamily: 'var(--mono)',
                  fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.03em',
                  textDecoration: 'none',
                }}
              >
                Open Today&apos;s Edition →
              </a>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 19, marginBottom: '0.5rem', color: 'var(--text)' }}>
                Read More Today
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                The Daily Ledger is a daily reading app designed for your specific interests. No algorithm, no ads, no opinions.
              </div>
              <a
                href="/signup"
                style={{
                  display: 'inline-block', background: 'var(--accent)', color: '#fff',
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
                  padding: '11px 26px', borderRadius: 8, textDecoration: 'none',
                }}
              >
                Sign Up Today
              </a>
            </>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '2rem 1.5rem',
      }}>
        <img src="/images/tdl-logo-mono.png" alt="" style={{ height: 20, width: 'auto' }} />
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          thedailyledger.app
        </div>
      </div>
    </div>
  )
}