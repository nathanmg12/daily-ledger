'use client'

import { useEffect, useRef, useState } from 'react'
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

function Preview({ card, format }) {
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
}

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

  function goTo(i) {
    const rail = railRef.current
    const next = Math.max(0, Math.min(formats.length - 1, i))
    setIndex(next)
    rail?.scrollTo({ left: rail.clientWidth * next, behavior: 'smooth' })
  }

  function onScroll() {
    const rail = railRef.current
    if (!rail || !rail.clientWidth) return
    const i = Math.round(rail.scrollLeft / rail.clientWidth)
    if (i !== index) setIndex(i)
  }

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
            className="tdl-rail-arrow left" onClick={() => goTo(index - 1)}
            disabled={index === 0} aria-label="Previous format"
          >‹</button>
          <button
            className="tdl-rail-arrow right" onClick={() => goTo(index + 1)}
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
