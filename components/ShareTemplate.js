'use client'

import { ACCENT, BACK_COLORS, TYPE_LABELS, cardFields, isQuotation } from './shareFields'

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

// The TDL monogram already sets its L in italic amber, so it carries the
// masthead treatment on its own wherever the layout is too tight for the
// full wordmark.
const LOGO_SRC = '/images/tdl-logo-mono.png'

const serif = { fontFamily: "'Playfair Display', Georgia, serif" }
const mono  = { fontFamily: "'DM Mono', monospace" }
const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 300 }

const CANVAS_BG = '#f0ede8'
const SURFACE   = '#faf9f7'
const INK       = '#1c1814'
const INK_2     = '#4a453e'
const MUTED     = '#9a9088'
const HAIRLINE  = 'rgba(0,0,0,0.07)'
const AMBER     = '#b5823a'

// Full wordmark, matching the app hero: Ledger italic in amber.
function Wordmark({ size }) {
  return (
    <span style={{ ...serif, fontSize: size, color: INK, letterSpacing: '0.02em' }}>
      The Daily <em style={{ fontStyle: 'italic', color: AMBER }}>Ledger</em>
    </span>
  )
}

// Compact footer: monogram left, url right, under a fading amber rule.
function FooterRow() {
  return (
    <div style={{ flexShrink: 0, padding: '0 24px 20px' }}>
      <div style={{
        height: 1,
        background: `linear-gradient(to right, rgba(181,130,58,0.55), rgba(181,130,58,0.08))`,
        marginBottom: 12,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={LOGO_SRC} alt="The Daily Ledger" style={{ height: 22, width: 'auto' }} />
        <div style={{ ...mono, fontSize: 9, color: MUTED, letterSpacing: '0.1em' }}>
          thedailyledger.app
        </div>
      </div>
    </div>
  )
}

// Tall formats have room for the full wordmark, so they get it.
function FooterStack() {
  return (
    <div style={{
      flexShrink: 0, padding: '0 24px 28px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <Wordmark size={17} />
      <div style={{ ...mono, fontSize: 11, color: MUTED, letterSpacing: '0.08em' }}>
        thedailyledger.app
      </div>
    </div>
  )
}

function Masthead({ size = 25 }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Wordmark size={size} />
      <div style={{ ...mono, fontSize: 11, color: MUTED, letterSpacing: '0.08em', marginTop: 7 }}>
        THE DAILY LEDGER
      </div>
    </div>
  )
}

// Renders whichever budgeted fields a card has, at the sizes a format asks for.
// Every template shares this, so the fields shown never drift between formats.
function Fields({ card, e = 13, k = 25.5, b = 17, align = 'left' }) {
  const a = ACCENT[card.type] || ACCENT.quote
  const f = cardFields(card)
  const quoting = isQuotation(card)

  return (
    <div data-share-inner style={{ textAlign: align }}>
      <div style={{
        ...mono, fontSize: e, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: a.color, marginBottom: 9,
      }}>
        {TYPE_LABELS[card.type]}
      </div>

      {f.kicker && (
        <div style={{ ...serif, fontSize: k, color: INK, lineHeight: 1.16, marginBottom: 7 }}>
          {f.kicker}
        </div>
      )}

      {f.idea && (
        <div style={{ ...sans, fontWeight: 500, fontSize: b * 1.05, color: INK, lineHeight: 1.4, marginBottom: 6 }}>
          {f.idea}
        </div>
      )}

      {f.badges?.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 9, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
          {f.badges.map((badge) => (
            <span key={badge} style={{
              ...mono, fontSize: e * 0.78, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: a.color, border: `0.5px solid ${a.color}`, borderRadius: 3, padding: '2.5px 6px',
            }}>
              {badge}
            </span>
          ))}
        </div>
      )}

      {f.quotation && (
        <div style={{ ...serif, fontSize: k * 1.06, fontStyle: 'italic', color: INK, lineHeight: 1.45 }}>
          &ldquo;{f.quotation}&rdquo;
        </div>
      )}

      {f.body && (
        <div style={{ ...sans, fontSize: b, color: INK_2, lineHeight: 1.6 }}>
          {f.body}
        </div>
      )}

      {f.attribution && (
        <div style={{ ...serif, fontSize: k * 0.82, color: INK, lineHeight: 1.2, marginTop: 10 }}>
          {f.attribution}
        </div>
      )}

      {f.meta && (
        <div style={{
          ...mono, fontSize: e * 0.9, color: MUTED, letterSpacing: '0.07em',
          marginTop: f.attribution ? 4 : 9,
        }}>
          {f.meta}
        </div>
      )}
    </div>
  )
}

// The fanned deck: two colour-blocked cards behind the real one, so the image
// reads as "one of many" without a word of explanation.
function Deck({ card, w, h, pad, sizes }) {
  const a = ACCENT[card.type] || ACCENT.quote
  const backs = BACK_COLORS[card.type] || ['#2e6da4', '#2a8a6e']
  const s = sizes.scale || 1

  const base = {
    position: 'absolute', width: w, height: h,
    background: SURFACE, borderRadius: 10 * s,
    border: `0.5px solid ${HAIRLINE}`, transformOrigin: 'center center',
  }

  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        ...base, borderLeft: `${4 * s}px solid ${backs[0]}`,
        boxShadow: `0 ${2 * s}px ${12 * s}px rgba(0,0,0,0.08)`,
        transform: `rotate(-6deg) translate(${-30 * s}px, ${16 * s}px)`, opacity: 0.5, zIndex: 1,
      }} />
      <div style={{
        ...base, borderLeft: `${4 * s}px solid ${backs[1]}`,
        boxShadow: `0 ${2 * s}px ${12 * s}px rgba(0,0,0,0.08)`,
        transform: `rotate(-2.5deg) translate(${-15 * s}px, ${8 * s}px)`, opacity: 0.7, zIndex: 2,
      }} />
      <div
        data-share-card
        style={{
          ...base, borderLeft: `${5 * s}px solid ${a.color}`,
          boxShadow: `0 ${8 * s}px ${32 * s}px rgba(0,0,0,0.18)`,
          transform: 'rotate(1.5deg)', padding: pad, overflow: 'hidden', zIndex: 3,
        }}
      >
        <Fields card={card} e={sizes.e} k={sizes.k} b={sizes.b} />
      </div>
    </div>
  )
}

// Two modes. The default renders offscreen under a fixed id, which is what
// dom-to-image captures. `inline` renders in normal flow with no id, so the
// share sheet can show several formats at once as live previews — the same
// components that will be exported, rather than hand-drawn approximations that
// drift. Only one element may carry the capture id, hence the omission.
function Root({ width, height, transparent, style, children, name, inline }) {
  const placement = inline
    ? { position: 'relative' }
    : { position: 'fixed', left: -9999, top: 0, visibility: 'hidden' }

  return (
    <div
      id={inline ? undefined : 'share-template-root'}
      data-share-style={name}
      style={{
        ...placement,
        width, height,
        background: transparent ? 'transparent' : CANVAS_BG,
        boxShadow: transparent ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.09)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        ...style,
      }}
    >
      <style>{FONT_CSS}</style>
      {children}
    </div>
  )
}

// ── STACK ───────────────────────────────────────────────────
function StackTemplate({ card, inline }) {
  return (
    <Root width={540} height={540} name="stack" inline={inline}>
      <Deck card={card} w={414} h={340} pad="22px 24px" sizes={{ scale: 1, e: 14, k: 25.5, b: 17 }} />
      <FooterRow />
    </Root>
  )
}

// ── POSTER ──────────────────────────────────────────────────
function PosterTemplate({ card, inline }) {
  const a = ACCENT[card.type] || ACCENT.quote
  return (
    <Root width={540} height={540} name="poster" inline={inline} style={{ padding: '52px 48px 0' }}>
      <div style={{ height: 4, width: 64, background: a.color, marginBottom: 28, flexShrink: 0 }} />
      <div data-share-card style={{ flex: 1, overflow: 'hidden' }}>
        <Fields card={card} e={16} k={32} b={18} />
      </div>
      <FooterRow />
    </Root>
  )
}

// ── STORY ───────────────────────────────────────────────────
// A page of the publication rather than type floating in cream: masthead and
// edition line above, content in the optical middle, wordmark at the foot.
function StoryTemplate({ card, inline }) {
  const a = ACCENT[card.type] || ACCENT.quote
  const f = cardFields(card)
  const quoting = isQuotation(card)

  return (
    <Root width={540} height={960} name="story" inline={inline} style={{ padding: '0 44px' }}>
      <div style={{ flexShrink: 0, paddingTop: 52 }}>
        <Masthead size={25} />
        <div style={{ height: 0.5, background: 'rgba(0,0,0,0.12)', marginTop: 20 }} />
      </div>

      <div
        data-share-card
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          textAlign: 'center', padding: '28px 0', overflow: 'hidden',
        }}
      >
        <div data-share-inner>
          <div style={{
            ...mono, fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: a.color, marginBottom: 26,
          }}>
            {TYPE_LABELS[card.type]}
          </div>

          {f.kicker && !quoting && (
            <div style={{ ...serif, fontSize: 31, color: INK, lineHeight: 1.2, marginBottom: 20 }}>
              {f.kicker}
            </div>
          )}
          {f.idea && (
            <div style={{ ...sans, fontWeight: 500, fontSize: 19, color: INK, lineHeight: 1.4, marginBottom: 16 }}>
              {f.idea}
            </div>
          )}

          <div style={{
            ...serif, fontSize: quoting ? 30 : 24, fontStyle: quoting ? 'italic' : 'normal',
            color: INK, lineHeight: 1.46,
          }}>
            {quoting ? `“${f.quotation}”` : f.body}
          </div>

          <div style={{ width: 50, height: 2, background: a.color, margin: '26px auto 20px' }} />
          <div style={{ ...mono, fontSize: 21, color: a.color, letterSpacing: '0.05em' }}>
            {(f.attribution || f.kicker || f.meta || '').toUpperCase()}
          </div>
        </div>
      </div>

      <FooterStack />
    </Root>
  )
}

// ── STACK STORY ─────────────────────────────────────────────
function StackStoryTemplate({ card, inline }) {
  return (
    <Root width={540} height={960} name="stackstory" inline={inline}>
      <div style={{ flexShrink: 0, padding: '56px 44px 0' }}>
        <Masthead size={25} />
      </div>
      <Deck card={card} w={470} h={470} pad="30px 32px" sizes={{ scale: 1.46, e: 13, k: 21.5, b: 15.5 }} />
      <FooterStack />
    </Root>
  )
}

// ── LANDSCAPE ───────────────────────────────────────────────
// 1200x630 is the Open Graph spec, so this layout doubles as the link preview.
function LandscapeTemplate({ card, inline }) {
  const a = ACCENT[card.type] || ACCENT.quote
  return (
    <Root
      width={1200} height={630} name="landscape" inline={inline}
      style={{ padding: 70, flexDirection: 'row', gap: 52, alignItems: 'stretch' }}
    >
      <div style={{ width: 9, background: a.color, borderRadius: 5, flexShrink: 0 }} />
      <div
        data-share-card
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}
      >
        <Fields card={card} e={23} k={43} b={29} />
      </div>
      <div style={{
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10,
      }}>
        <Wordmark size={26} />
        <div style={{ ...mono, fontSize: 16, color: MUTED, letterSpacing: '0.07em' }}>
          thedailyledger.app
        </div>
      </div>
    </Root>
  )
}

// ── STICKER ─────────────────────────────────────────────────
// Transparent canvas, opaque card, real shadow — drops onto any background.
function StickerTemplate({ card, inline }) {
  const a = ACCENT[card.type] || ACCENT.quote
  return (
    <Root
      width={540} height={540} name="sticker" transparent inline={inline}
      style={{ padding: 44, justifyContent: 'center' }}
    >
      <div
        data-share-card
        style={{
          background: SURFACE, borderRadius: 14, border: `0.5px solid ${HAIRLINE}`,
          borderLeft: `5px solid ${a.color}`, padding: '32px 30px', overflow: 'hidden',
          boxShadow: '0 18px 44px rgba(0,0,0,0.22), 0 3px 10px rgba(0,0,0,0.10)',
        }}
      >
        <Fields card={card} e={13} k={23.5} b={15} />
        <div style={{
          height: 1, marginTop: 20, marginBottom: 12,
          background: 'linear-gradient(to right, rgba(181,130,58,0.5), rgba(181,130,58,0.06))',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={LOGO_SRC} alt="The Daily Ledger" style={{ height: 20, width: 'auto' }} />
          <div style={{ ...mono, fontSize: 9, color: MUTED, letterSpacing: '0.1em' }}>
            thedailyledger.app
          </div>
        </div>
      </div>
    </Root>
  )
}

// ── CIRCLE ──────────────────────────────────────────────────
// A seal rather than a card. Quotes and scripture only — nothing longer sits
// in a round frame legibly.
function CircleTemplate({ card, inline }) {
  const a = ACCENT[card.type] || ACCENT.quote
  const f = cardFields(card)

  return (
    <Root
      width={540} height={540} name="circle" transparent inline={inline}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        data-share-card
        style={{
          width: 496, height: 496, borderRadius: '50%', background: SURFACE,
          border: `3px solid ${a.color}`, boxShadow: '0 18px 44px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '70px 64px', overflow: 'hidden',
        }}
      >
        <div data-share-inner>
          <div style={{
            ...mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: a.color, marginBottom: 18,
          }}>
            {TYPE_LABELS[card.type]}
          </div>
          <div style={{ ...serif, fontSize: 23, fontStyle: 'italic', color: INK, lineHeight: 1.44 }}>
            &ldquo;{f.quotation}&rdquo;
          </div>
          <div style={{ width: 34, height: 2, background: a.color, margin: '18px auto 14px' }} />
          <div style={{ ...mono, fontSize: 11, color: a.color, letterSpacing: '0.07em' }}>
            {(f.attribution || '').toUpperCase()}
          </div>
          <div style={{ ...mono, fontSize: 9, color: MUTED, letterSpacing: '0.1em', marginTop: 16 }}>
            thedailyledger.app
          </div>
        </div>
      </div>
    </Root>
  )
}

const TEMPLATES = {
  stack: StackTemplate,
  poster: PosterTemplate,
  story: StoryTemplate,
  stackstory: StackStoryTemplate,
  landscape: LandscapeTemplate,
  sticker: StickerTemplate,
  circle: CircleTemplate,
}

export default function ShareTemplate({ card, style = 'stack', inline = false }) {
  if (!card) return null
  const Template = TEMPLATES[style] || StackTemplate
  return <Template card={card} inline={inline} />
}
