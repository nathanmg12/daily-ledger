'use client'

const ACCENT = {
  scripture:      { color: '#b5823a', bg: 'rgba(181,130,58,0.08)',  border: 'rgba(181,130,58,0.2)',  leftColor: '#b5823a' },
  quote:          { color: '#8a6a20', bg: 'rgba(138,106,32,0.08)',  border: 'rgba(138,106,32,0.2)',  leftColor: '#8a6a20' },
  quick_facts:    { color: '#b85c45', bg: 'rgba(184,92,69,0.08)',   border: 'rgba(184,92,69,0.2)',   leftColor: '#b85c45' },
  book_summary:   { color: '#6b52a8', bg: 'rgba(107,82,168,0.08)',  border: 'rgba(107,82,168,0.2)',  leftColor: '#6b52a8' },
  food_spotlight: { color: '#8a6a20', bg: 'rgba(138,106,32,0.08)',  border: 'rgba(138,106,32,0.2)',  leftColor: '#8a6a20' },
  research:       { color: '#2e6da4', bg: 'rgba(46,109,164,0.08)',  border: 'rgba(46,109,164,0.2)',  leftColor: '#2e6da4' },
  protocol:       { color: '#3a7a3a', bg: 'rgba(58,122,58,0.08)',   border: 'rgba(58,122,58,0.2)',   leftColor: '#3a7a3a' },
}

// Back card colors — pick two that contrast with the front card type
const BACK_COLORS = {
  scripture:      ['#2e6da4', '#2a8a6e'],
  quote:          ['#3a7a3a', '#6b52a8'],
  quick_facts:    ['#6b52a8', '#2e6da4'],
  book_summary:   ['#2a8a6e', '#b85c45'],
  food_spotlight: ['#3a7a3a', '#2e6da4'],
  research:       ['#3a7a3a', '#6b52a8'],
  protocol:       ['#2e6da4', '#b85c45'],
}

const TYPE_LABELS = {
  scripture: 'Scripture', quote: 'Quote', quick_facts: 'Quick Fact',
  book_summary: 'Book Summary', food_spotlight: 'Food Spotlight',
  research: 'Research', protocol: 'Protocol',
}

const FONT_CSS = `
  @font-face {
    font-family: 'Playfair Display';
    font-style: normal;
    font-weight: 100 900;
    src: url('/fonts/PlayfairDisplay.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Playfair Display';
    font-style: italic;
    font-weight: 100 900;
    src: url('/fonts/PlayfairDisplay-Italic.ttf') format('truetype');
  }
  @font-face {
    font-family: 'DM Sans';
    font-style: normal;
    font-weight: 100 900;
    src: url('/fonts/DMSans.ttf') format('truetype');
  }
  @font-face {
    font-family: 'DM Mono';
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/DMMono-Regular.ttf') format('truetype');
  }
`

const serif = { fontFamily: "'Playfair Display', Georgia, serif" }
const mono  = { fontFamily: "'DM Mono', monospace" }
const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 300 }

function Eyebrow({ color, children }) {
  return (
    <div style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 10 }}>
      {children}
    </div>
  )
}

function Footer() {
  return (
    <div style={{ flexShrink: 0, padding: '0 24px 20px' }}>
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, rgba(181,130,58,0.55), rgba(181,130,58,0.08))',
        marginBottom: 12,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ ...serif, fontSize: 15, color: '#1c1814', fontWeight: 400, whiteSpace: 'nowrap' }}>
          The Daily <em style={{ fontStyle: 'italic', color: '#b5823a' }}>Ledger</em>
        </div>
        <div style={{ ...mono, fontSize: 9, color: '#9a9088', letterSpacing: '0.1em' }}>
          thedailyledger.app
        </div>
      </div>
    </div>
  )
}

function CardContent({ card }) {
  const c = card.content
  const a = ACCENT[card.type] || ACCENT.quote

  return (
    <div data-share-inner>
      <Eyebrow color={a.color}>{TYPE_LABELS[card.type]}</Eyebrow>

      {card.type === 'scripture' && (
        <>
          <div style={{ ...serif, fontSize: 22, fontStyle: 'italic', color: '#1c1814', lineHeight: 1.55, marginBottom: 10 }}>
            &ldquo;{c.verse}&rdquo;
          </div>
          <div style={{ ...mono, fontSize: 13, color: a.color, marginBottom: 12 }}>
            {c.reference} · {c.translation}
          </div>
          <div style={{ ...sans, fontSize: 16, color: '#4a453e', lineHeight: 1.7 }}>{c.context}</div>
        </>
      )}

      {card.type === 'quote' && (
        <>
          <div style={{ ...serif, fontSize: 22, fontStyle: 'italic', color: '#1c1814', lineHeight: 1.55, marginBottom: 10 }}>
            &ldquo;{c.quote}&rdquo;
          </div>
          <div style={{ ...mono, fontSize: 13, color: a.color, marginBottom: 12 }}>
            — {c.author}{c.source ? ` · ${c.source}` : ''}
          </div>
          <div style={{ ...sans, fontSize: 16, color: '#4a453e', lineHeight: 1.7 }}>{c.context}</div>
        </>
      )}

      {card.type === 'quick_facts' && (
        <div style={{ ...sans, fontSize: 20, color: '#1c1814', lineHeight: 1.7 }}>{c.fact}</div>
      )}

      {card.type === 'book_summary' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 6, background: a.bg,
              border: '0.5px solid rgba(0,0,0,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>
              {c.cover_emoji || '📚'}
            </div>
            <div>
              <div style={{ ...serif, fontSize: 18, color: '#1c1814', lineHeight: 1.3 }}>{c.title}</div>
              <div style={{ ...mono, fontSize: 12, color: '#9a9088', marginTop: 3 }}>{c.author}</div>
            </div>
          </div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9088', marginBottom: 12 }}>
            {c.ideas?.length} ideas from this book
          </div>
          {c.ideas?.map((idea, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ ...mono, fontSize: 12, color: a.color, marginBottom: 3 }}>{String(i + 1).padStart(2, '0')} /</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#1c1814', lineHeight: 1.4, marginBottom: 4 }}>{idea.title}</div>
              <div style={{ ...sans, fontSize: 14, color: '#4a453e', lineHeight: 1.65 }}>{idea.body}</div>
            </div>
          ))}
        </>
      )}

      {card.type === 'food_spotlight' && (
        <>
          <div style={{ ...serif, fontSize: 24, color: '#1c1814', marginBottom: 4 }}>{c.name}</div>
          <div style={{ ...mono, fontSize: 12, color: '#9a9088', marginBottom: 14 }}>Food Spotlight</div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a9088', marginBottom: 4 }}>Overview</div>
          <div style={{ ...sans, fontSize: 16, color: '#4a453e', lineHeight: 1.6, marginBottom: 12 }}>{c.intro}</div>
          {c.bottom_line && (
            <div style={{ ...sans, fontSize: 15, color: '#4a453e', lineHeight: 1.6 }}>{c.bottom_line}</div>
          )}
        </>
      )}

      {card.type === 'research' && (
        <>
          <div style={{ ...mono, fontSize: 12, color: a.color, marginBottom: 8 }}>
            {c.journal}{c.published_at ? ` · ${c.published_at.slice(0, 4)}` : ''}
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#1c1814', lineHeight: 1.4, marginBottom: 10 }}>{c.title}</div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: a.color, marginBottom: 6 }}>TL;DR</div>
          <div style={{ ...sans, fontSize: 16, color: '#4a453e', lineHeight: 1.7 }}>{c.tldr}</div>
          {c.takeaway && (
            <div style={{ ...sans, fontSize: 15, color: '#4a453e', lineHeight: 1.7, marginTop: 12, fontStyle: 'italic', borderLeft: '2px solid rgba(0,0,0,0.07)', paddingLeft: 12 }}>
              {c.takeaway}
            </div>
          )}
        </>
      )}

      {card.type === 'protocol' && (
        <>
          <div style={{ ...serif, fontSize: 22, color: '#1c1814', marginBottom: 6 }}>{c.name}</div>
          {c.evidence_level && (
            <div style={{
              ...mono, display: 'inline-block', fontSize: 11, letterSpacing: '0.07em',
              textTransform: 'uppercase', borderRadius: 3, padding: '3px 9px', marginBottom: 12,
              color: a.color, background: a.bg, border: `0.5px solid ${a.border}`,
            }}>
              {c.evidence_level}
            </div>
          )}
          <div style={{ ...sans, fontSize: 16, color: '#4a453e', lineHeight: 1.7 }}>{c.overview}</div>
          {c.how_to_start && (
            <div style={{ ...sans, fontSize: 15, color: '#4a453e', lineHeight: 1.7, marginTop: 12 }}>{c.how_to_start}</div>
          )}
        </>
      )}
    </div>
  )
}

// ── STACK TEMPLATE ──────────────────────────────────────────
function StackTemplate({ card }) {
  const a = card ? (ACCENT[card.type] || ACCENT.quote) : ACCENT.quote
  const backs = card ? (BACK_COLORS[card.type] || ['#2e6da4', '#2a8a6e']) : ['#2e6da4', '#2a8a6e']

  const cardBase = {
    position: 'absolute',
    width: 390,
    height: 310,
    background: '#faf9f7',
    borderRadius: 10,
    border: '0.5px solid rgba(0,0,0,0.07)',
    transformOrigin: 'center center',
  }

  return (
    <div
      id="share-template-root"
      style={{
        position: 'fixed', left: -9999, top: 0, visibility: 'hidden',
        width: 540, height: 540,
        background: '#f0ede8',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.09)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{FONT_CSS}</style>

      {/* Stack area — takes up most of the space */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Back card 1 */}
        <div style={{
          ...cardBase,
          borderLeft: `4px solid ${backs[0]}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transform: 'rotate(-6deg) translate(-30px, 16px)',
          opacity: 0.5,
          zIndex: 1,
        }} />
        {/* Back card 2 */}
        <div style={{
          ...cardBase,
          borderLeft: `4px solid ${backs[1]}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transform: 'rotate(-2.5deg) translate(-15px, 8px)',
          opacity: 0.7,
          zIndex: 2,
        }} />
        {/* Front card — centered */}
        <div
          data-share-card
          style={{
            ...cardBase,
            borderLeft: `5px solid ${a.leftColor}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            transform: 'rotate(1.5deg)',
            padding: '20px 22px',
            overflow: 'hidden',
            zIndex: 3,
          }}
        >
          {card && <CardContent card={card} />}
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ── POSTER TEMPLATE ─────────────────────────────────────────
function PosterTemplate({ card }) {
  const a = card ? (ACCENT[card.type] || ACCENT.quote) : ACCENT.quote
  const c = card?.content

  return (
    <div
      id="share-template-root"
      style={{
        position: 'fixed', left: -9999, top: 0, visibility: 'hidden',
        width: 540, height: 540,
        background: '#f0ede8',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.09)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 48px 0',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{FONT_CSS}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} data-share-card>
        <div data-share-inner>
          {/* Eyebrow */}
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: a.color, marginBottom: 20 }}>
            {card ? TYPE_LABELS[card.type] : ''}
          </div>

          {card?.type === 'scripture' && (
            <>
              <div style={{ ...serif, fontSize: 26, fontStyle: 'italic', color: '#1c1814', lineHeight: 1.5, marginBottom: 16 }}>
                &ldquo;{c.verse}&rdquo;
              </div>
              <div style={{ ...mono, fontSize: 13, color: a.color }}>
                {c.reference} · {c.translation}
              </div>
            </>
          )}

          {card?.type === 'quote' && (
            <>
              <div style={{ ...serif, fontSize: 26, fontStyle: 'italic', color: '#1c1814', lineHeight: 1.5, marginBottom: 16 }}>
                &ldquo;{c.quote}&rdquo;
              </div>
              <div style={{ ...mono, fontSize: 13, color: a.color }}>
                — {c.author}{c.source ? ` · ${c.source}` : ''}
              </div>
            </>
          )}

          {card?.type === 'quick_facts' && (
            <div style={{ ...sans, fontSize: 24, color: '#1c1814', lineHeight: 1.65, fontWeight: 300 }}>{c.fact}</div>
          )}

          {card?.type === 'book_summary' && (
            <>
              <div style={{ ...serif, fontSize: 22, color: '#1c1814', marginBottom: 6 }}>{c.title}</div>
              <div style={{ ...mono, fontSize: 12, color: '#9a9088', marginBottom: 20 }}>{c.author}</div>
              <div style={{ ...sans, fontSize: 18, color: '#4a453e', lineHeight: 1.7 }}>
                {c.ideas?.[0]?.body}
              </div>
            </>
          )}

          {card?.type === 'food_spotlight' && (
            <>
              <div style={{ ...serif, fontSize: 28, color: '#1c1814', marginBottom: 16 }}>{c.name}</div>
              <div style={{ ...sans, fontSize: 18, color: '#4a453e', lineHeight: 1.65 }}>{c.intro}</div>
            </>
          )}

          {card?.type === 'research' && (
            <>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#1c1814', lineHeight: 1.4, marginBottom: 16 }}>{c.title}</div>
              <div style={{ ...sans, fontSize: 18, color: '#4a453e', lineHeight: 1.7 }}>{c.tldr}</div>
            </>
          )}

          {card?.type === 'protocol' && (
            <>
              <div style={{ ...serif, fontSize: 26, color: '#1c1814', marginBottom: 16 }}>{c.name}</div>
              <div style={{ ...sans, fontSize: 18, color: '#4a453e', lineHeight: 1.7 }}>{c.overview}</div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ── MAIN EXPORT ──────────────────────────────────────────────
export default function ShareTemplate({ card, style = 'stack' }) {
  if (style === 'poster') return <PosterTemplate card={card} />
  return <StackTemplate card={card} />
}