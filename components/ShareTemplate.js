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

function Pill({ color, bg, border, children }) {
  return (
    <div style={{
      ...mono, display: 'inline-block', fontSize: 13, letterSpacing: '0.07em',
      textTransform: 'uppercase', borderRadius: 3, padding: '4px 10px',
      marginBottom: 10, color, background: bg, border: `0.5px solid ${border}`,
    }}>
      {children}
    </div>
  )
}

function Eyebrow({ color, children }) {
  return (
    <div style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 10 }}>
      {children}
    </div>
  )
}

function CardContent({ card }) {
  const c = card.content
  const a = ACCENT[card.type] || ACCENT.quote
  const interest = card.interests?.[0]

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

export default function ShareTemplate({ card }) {
  const a = card ? (ACCENT[card.type] || ACCENT.quote) : ACCENT.quote

  return (
    <div
      id="share-template-root"
      style={{
        position: 'fixed', left: -9999, top: 0, visibility: 'hidden',
        width: 540, height: 540,
        background: '#f0ede8',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.09)',
        display: 'flex', flexDirection: 'column',
        padding: '18px 24px 0',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{FONT_CSS}</style>

      {/* Header — wordmark left, URL right */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 12, flexShrink: 0,
      }}>
        <div style={{ ...serif, fontSize: 15, color: '#1c1814', fontWeight: 400 }}>
          The Daily <em style={{ fontStyle: 'italic', color: '#b5823a' }}>Ledger</em>
        </div>
        <div style={{ ...mono, fontSize: 9, color: '#9a9088', letterSpacing: '0.1em' }}>
          thedailyledger.app
        </div>
      </div>

      {/* Card */}
      <div
        data-share-card
        style={{
          flex: 1, overflow: 'hidden', borderRadius: 6, position: 'relative',
          background: '#faf9f7',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderLeftWidth: '2.5px',
          borderLeftColor: a.leftColor,
          boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
          padding: '16px 18px',
        }}
      >
        {card && <CardContent card={card} />}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 14, flexShrink: 0 }} />
    </div>
  )
}