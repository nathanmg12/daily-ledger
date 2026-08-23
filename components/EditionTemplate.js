'use client'

import { ACCENT, TYPE_LABELS, cardFields, editionFields } from './shareFields'

const FONT_CSS = `
  @font-face { font-family:'Playfair Display'; font-style:normal; font-weight:100 900;
    src:url('/fonts/PlayfairDisplay.ttf') format('truetype'); }
  @font-face { font-family:'Playfair Display'; font-style:italic; font-weight:100 900;
    src:url('/fonts/PlayfairDisplay-Italic.ttf') format('truetype'); }
  @font-face { font-family:'DM Sans'; font-style:normal; font-weight:100 900;
    src:url('/fonts/DMSans.ttf') format('truetype'); }
  @font-face { font-family:'DM Mono'; font-style:normal; font-weight:400;
    src:url('/fonts/DMMono-Regular.ttf') format('truetype'); }
`

const serif = { fontFamily: "'Playfair Display', Georgia, serif" }
const mono  = { fontFamily: "'DM Mono', monospace" }
const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 300 }

const INK = '#1c1814'
const INK_2 = '#4a453e'
const MUTED = '#9a9088'
const AMBER = '#b5823a'

export const EDITION_DIMENSIONS = { width: 540, height: 960 }

function Wordmark({ size }) {
  return (
    <span style={{
      ...serif, fontSize: size, color: INK, letterSpacing: '0.02em',
      whiteSpace: 'nowrap', display: 'inline-block', lineHeight: 1.25,
    }}>
      The Daily <em style={{ fontStyle: 'italic', color: AMBER }}>Ledger</em>
    </span>
  )
}

// Shares the day rather than a card, so it is reached from the end-of-ledger
// marker instead of any card's share sheet.
export default function EditionTemplate({ cards, edition, dateLabel, inline = false }) {
  const { lead, named, questions, remaining } = editionFields(cards)
  if (!lead) return null

  const leadAccent = (ACCENT[lead.type] || ACCENT.quote).color
  const leadFields = cardFields(lead)
  const leadText = leadFields.quotation || leadFields.body || ''
  const leadAttr = leadFields.attribution || leadFields.kicker || ''

  const placement = inline
    ? { position: 'relative' }
    : { position: 'fixed', left: -9999, top: 0, visibility: 'hidden' }

  return (
    <div
      id={inline ? undefined : 'edition-template-root'}
      data-edition-root
      style={{
        ...placement,
        width: EDITION_DIMENSIONS.width, height: EDITION_DIMENSIONS.height,
        background: '#f0ede8', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.09)',
        display: 'flex', flexDirection: 'column', padding: '52px 46px 0',
        fontFamily: "'DM Sans', system-ui, sans-serif", boxSizing: 'border-box',
      }}
    >
      <style>{FONT_CSS}</style>

      {/* Masthead: the heavy rule under the wordmark is what makes this read as
          a paper rather than a poster. */}
      <div style={{ flexShrink: 0, textAlign: 'center' }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: '0.22em', color: MUTED }}>EST. 2026</div>
        <div style={{ marginTop: 8 }}><Wordmark size={38} /></div>
        <div style={{ height: 2, background: INK, marginTop: 14, opacity: 0.85 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
          <span style={{ ...mono, fontSize: 10, color: MUTED, letterSpacing: '0.07em' }}>
            NO. {String(edition ?? 1).padStart(3, '0')}
          </span>
          <span style={{ ...mono, fontSize: 10, color: MUTED, letterSpacing: '0.07em' }}>
            {(dateLabel || '').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Lead. Left aligned behind an amber rail, echoing the coloured left
          border every card in the app carries. */}
      <div data-edition-card style={{ flexShrink: 0, padding: '34px 0 30px', display: 'flex', gap: 22 }}>
        <div style={{ width: 4, background: AMBER, borderRadius: 2, flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
          <div style={{
            ...mono, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: leadAccent, marginBottom: 16,
          }}>
            {TYPE_LABELS[lead.type]}
          </div>
          <div style={{ ...serif, fontSize: 27, fontStyle: 'italic', color: INK, lineHeight: 1.42 }}>
            &ldquo;{leadText}&rdquo;
          </div>
          {leadAttr && (
            <div style={{ ...mono, fontSize: 13, color: leadAccent, letterSpacing: '0.06em', marginTop: 18 }}>
              {leadAttr.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 0.5, background: 'rgba(0,0,0,0.16)', flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 20, overflow: 'hidden' }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: '0.2em', color: MUTED, marginBottom: 15 }}>
          ALSO INSIDE
        </div>

        {/* Type label above the title rather than in a left column. A fixed
            label column pushed every title 116px in while the questions
            beneath started at the margin, so the index read as two ragged
            lists. Stacked, everything shares one left edge. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {named.map(({ type, handle }) => (
            <div key={`${type}-${handle}`}>
              <div style={{
                ...mono, fontSize: 9, letterSpacing: '0.14em',
                color: (ACCENT[type] || ACCENT.quote).color, marginBottom: 3,
              }}>
                {(TYPE_LABELS[type] || '').toUpperCase()}
              </div>
              <div style={{ ...serif, fontSize: 20, color: INK, lineHeight: 1.2 }}>{handle}</div>
            </div>
          ))}
        </div>

        {questions.length > 0 && (
          <>
            <div style={{ height: 0.5, background: 'rgba(0,0,0,0.10)', margin: '16px 0 14px' }} />
            <div style={{
              ...mono, fontSize: 9, letterSpacing: '0.14em',
              color: ACCENT.quick_facts.color, marginBottom: 9,
            }}>
              QUICK FACTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {questions.map((q) => (
                <div key={q} style={{ ...serif, fontSize: 17, color: INK, lineHeight: 1.32 }}>{q}</div>
              ))}
            </div>
          </>
        )}

        {remaining > 0 && (
          <div style={{ ...mono, fontSize: 11, color: MUTED, letterSpacing: '0.14em', marginTop: 18 }}>
            AND {remaining} MORE INSIDE
          </div>
        )}
      </div>

      <div style={{
        flexShrink: 0, padding: '0 0 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <Wordmark size={17} />
        <span style={{ ...mono, fontSize: 11, color: MUTED, letterSpacing: '0.08em' }}>
          thedailyledger.app
        </span>
      </div>
    </div>
  )
}
