'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import ShareTemplate from '@/components/ShareTemplate'
import { CIRCLE_TYPES } from '@/components/shareFields'

// Ordered so the aspect ratio only changes twice as you swipe: link, then the
// squares, then the tall pair, then the wide one. Link leads because a pasted
// link travels furthest, and it now previews as a real card rather than a bare
// URL — showing that preview is what makes it worth sending.
export const SHARE_FORMATS = [
  { id: 'link',       name: 'Link',        note: 'Preview when pasted' },
  { id: 'stack',      name: 'Stack',       note: '1080 × 1080',                 w: 540,  h: 540 },
  { id: 'poster',     name: 'Poster',      note: '1080 × 1080',                 w: 540,  h: 540 },
  { id: 'sticker',    name: 'Sticker',     note: '1080 × 1080 · transparent',   w: 540,  h: 540, transparent: true },
  { id: 'circle',     name: 'Circle',      note: '1080 × 1080 · transparent',   w: 540,  h: 540, transparent: true, quotesOnly: true },
  { id: 'stackstory', name: 'Stack Story', note: '1080 × 1920',                 w: 540,  h: 960 },
  { id: 'story',      name: 'Story',       note: '1080 × 1920',                 w: 540,  h: 960 },
  { id: 'landscape',  name: 'Landscape',   note: '1200 × 630',                  w: 1200, h: 630 },
]

const LAST_FORMAT_KEY = 'tdl:last-share-format'

export function formatsForCard(card) {
  return SHARE_FORMATS.filter((f) => !f.quotesOnly || CIRCLE_TYPES.has(card.type))
}

const BOX = { w: 292, h: 330 }

// Memoised because scrolling updates the active index on the parent, and
// without this every scroll frame re-rendered all eight previews — each one a
// full card template under a transform. The previews never change once the
// card is chosen, so they should never re-render at all.
const Preview = memo(function Preview({ card, format }) {
  if (format.id === 'link') return <LinkPreview card={card} />

  const scale = Math.min(BOX.w / format.w, BOX.h / format.h)
  return (
    <div
      className={format.transparent ? 'tdl-alpha' : undefined}
      style={{
        width: Math.round(format.w * scale),
        height: Math.round(format.h * scale),
        overflow: 'hidden',
        border: '0.5px solid var(--border-med)',
        flexShrink: 0,
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <ShareTemplate card={card} style={format.id} inline />
      </div>
    </div>
  )
})

// Shows what a pasted link actually looks like, using the same Landscape
// layout that gets stored as the card's preview image.
function LinkPreview({ card }) {
  const scale = 268 / 1200
  const title =
    card.type === 'quote' || card.type === 'scripture'
      ? `“${(card.content?.quote || card.content?.verse || '').slice(0, 64)}…”`
      : card.title

  return (
    <div style={{ width: 288, background: 'var(--surface2)', borderRadius: 16, padding: 9 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 11, overflow: 'hidden', border: '0.5px solid var(--border)' }}>
        <div style={{ width: 268, height: Math.round(630 * scale), overflow: 'hidden' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <ShareTemplate card={card} style="landscape" inline />
          </div>
        </div>
        <div style={{ padding: '9px 11px 11px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.25 }}>
            {title}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: 5 }}>
            THEDAILYLEDGER.APP
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShareSheet({ card, onClose, onExport, onCopyLink, busy, linkState }) {
  const formats = formatsForCard(card)
  const railRef = useRef(null)
  const [index, setIndex] = useState(() => {
    if (typeof window === 'undefined') return 0
    const saved = window.localStorage.getItem(LAST_FORMAT_KEY)
    const i = formats.findIndex((f) => f.id === saved)
    return i >= 0 ? i : 0
  })

  const active = formats[index] || formats[0]

  // Scroll position is the source of truth so native touch swiping and the
  // arrows stay in agreement.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollTo({ left: rail.clientWidth * index, behavior: 'auto' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (active) window.localStorage.setItem(LAST_FORMAT_KEY, active.id)
  }, [active])

  // Arrow presses target a running index rather than the one derived from
  // scroll position. Pressing quickly used to queue smooth scrolls that each
  // started from wherever the previous one had reached, so presses were
  // swallowed and the rail appeared to stall.
  const targetRef = useRef(index)

  const goTo = useCallback((i) => {
    const rail = railRef.current
    if (!rail) return
    const next = Math.max(0, Math.min(formats.length - 1, i))
    targetRef.current = next
    setIndex(next)
    rail.scrollTo({ left: rail.clientWidth * next, behavior: 'smooth' })
  }, [formats.length])

  const step = useCallback((delta) => goTo(targetRef.current + delta), [goTo])

  // Coalesce to one read per frame. Scroll fires far more often than the
  // active slide can actually change, and each state update re-runs the sheet.
  const frameRef = useRef(null)
  const onScroll = useCallback(() => {
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const rail = railRef.current
      if (!rail || !rail.clientWidth) return
      const i = Math.round(rail.scrollLeft / rail.clientWidth)
      targetRef.current = i
      setIndex((prev) => (prev === i ? prev : i))
    })
  }, [])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  const isLink = active?.id === 'link'
  const linkLabel = { idle: 'Copy link', copying: 'Copying…', copied: '✓ Link copied', error: 'Failed — try again' }[linkState]

  return (
    <div className="tdl-sheet-scrim" onClick={onClose}>
      <div className="tdl-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share card">
        <div className="tdl-sheet-grab" />

        <div className="tdl-sheet-head">
          <span className="tdl-sheet-title">Share</span>
          <button className="tdl-sheet-close" onClick={onClose}>CLOSE</button>
        </div>

        <div className="tdl-rail-wrap">
          <button
            className="tdl-rail-arrow left" onClick={() => step(-1)}
            disabled={index === 0} aria-label="Previous format"
          >‹</button>
          <button
            className="tdl-rail-arrow right" onClick={() => step(1)}
            disabled={index === formats.length - 1} aria-label="Next format"
          >›</button>

          <div className="tdl-rail" ref={railRef} onScroll={onScroll}>
            {formats.map((f) => (
              <div className="tdl-rail-slide" key={f.id}>
                <Preview card={card} format={f} />
              </div>
            ))}
          </div>
        </div>

        <div className="tdl-fmt">
          <div className="tdl-fmt-name">{active?.name}</div>
          <div className="tdl-fmt-note">{active?.note}</div>
        </div>

        <div className="tdl-dots">
          {formats.map((f, i) => (
            <button
              key={f.id} className={`tdl-dot${i === index ? ' on' : ''}`}
              onClick={() => goTo(i)} aria-label={f.name}
            />
          ))}
        </div>

        <div className="tdl-sheet-actions">
          <button
            className="tdl-btn primary"
            disabled={busy || linkState === 'copying'}
            onClick={() => (isLink ? onCopyLink() : onExport(active.id))}
          >
            {isLink ? linkLabel : busy ? 'Preparing…' : 'Share image'}
          </button>
        </div>
      </div>
    </div>
  )
}
