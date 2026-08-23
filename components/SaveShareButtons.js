'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import domtoimage from 'dom-to-image-more'
import ShareSheet, { SHARE_FORMATS } from '@/components/ShareSheet'

// Export dimensions per format. scale:2 doubles these for the actual PNG
// (540x960 -> 1080x1920), which is why the sheet advertises the doubled size.
const DIMENSIONS = Object.fromEntries(
  SHARE_FORMATS.filter((f) => f.w).map((f) => [f.id, { width: f.w, height: f.h, transparent: !!f.transparent }])
)

// Colour the overflow fade blends into, per format. With per-type content
// budgets in place this should almost never fire — it stays as a backstop for
// a card whose fields run unusually long. Transparent formats are absent on
// purpose: fading to opaque cream on a sticker would defeat the alpha.
const FADE_BG = {
  stack:      '250,249,247',
  poster:     '240,237,232',
  story:      '240,237,232',
  stackstory: '250,249,247',
  landscape:  '240,237,232',
}

export default function SaveShareButtons({ card, savedCardIds, userId, onUnsave }) {
  const [saved, setSaved] = useState(savedCardIds?.has(card.id) ?? false)
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [confirmingUnsave, setConfirmingUnsave] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [linkState, setLinkState] = useState('idle') // idle | copying | copied | error
  const supabase = createClient()

  async function handleSaveToggle(e) {
    e.stopPropagation()
    if (saving) return
    if (saved) { setConfirmingUnsave(true); return }
    setSaving(true)
    const { error } = await supabase
      .from('user_saved_cards')
      .insert({ user_id: userId, card_id: card.id })
    if (!error) setSaved(true)
    setSaving(false)
  }

  async function confirmUnsave(e) {
    e.stopPropagation()
    setSaving(true)
    setConfirmingUnsave(false)
    const { error } = await supabase
      .from('user_saved_cards')
      .delete()
      .eq('user_id', userId)
      .eq('card_id', card.id)
    if (!error) { setSaved(false); onUnsave?.() }
    setSaving(false)
  }

  function cancelUnsave(e) {
    e.stopPropagation()
    setConfirmingUnsave(false)
  }

  function handleShareClick(e) {
    e.stopPropagation()
    if (sharing) return
    setShowSheet(true)
  }

  async function generateAndShare(style) {
    setSharing(true)

    try {
      // Hand the offscreen template the card and format, then wait a frame for
      // it to mount before capturing.
      window.dispatchEvent(new CustomEvent('tdl-share', { detail: { card, style } }))
      await new Promise((resolve) => setTimeout(resolve, 120))

      const container = document.getElementById('share-template-root')
      if (!container) throw new Error('Share template not found')

      container.style.visibility = 'visible'

      const dims = DIMENSIONS[style] || DIMENSIONS.stack

      // Backstop for a card that still overflows its frame despite the budget.
      const cardEl = container.querySelector('[data-share-card]')
      const innerEl = container.querySelector('[data-share-inner]')
      let fadeEl = null
      const fadeRgb = FADE_BG[style]

      if (fadeRgb && cardEl && innerEl && innerEl.scrollHeight > cardEl.clientHeight) {
        fadeEl = document.createElement('div')
        fadeEl.style.cssText = [
          'position:absolute', 'bottom:0', 'left:0', 'right:0', 'height:80px',
          `background:linear-gradient(to bottom, rgba(${fadeRgb},0) 0%, rgba(${fadeRgb},0.85) 40%, rgba(${fadeRgb},1) 100%)`,
          'display:flex', 'align-items:flex-end', 'justify-content:center',
          'padding:0 22px 14px', 'pointer-events:none',
        ].join(';')
        fadeEl.innerHTML = '<span style="font-size:20px;color:#9a9088;letter-spacing:0.15em;line-height:1;">···</span>'
        if (getComputedStyle(cardEl).position === 'static') cardEl.style.position = 'relative'
        cardEl.appendChild(fadeEl)
      }

      const blob = await domtoimage.toBlob(container, {
        width: dims.width,
        height: dims.height,
        style: { transform: 'none' },
        scale: 2,
        skipFonts: true,
        ignoreCSSRuleErrors: true,
        // Omitting bgcolor keeps the alpha channel, which is what makes the
        // Sticker and Circle formats droppable onto any background.
        ...(dims.transparent ? {} : { bgcolor: undefined }),
        filter: (node) => {
          if (node.tagName === 'LINK' && node.href?.includes('fonts.googleapis.com')) return false
          return true
        },
      })

      container.style.visibility = 'hidden'
      if (fadeEl) fadeEl.remove()

      const file = new File([blob], `tdl-${style}.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'The Daily Ledger' })
        } catch (err) {
          if (err.name !== 'AbortError') downloadBlob(blob, style)
        }
      } else {
        downloadBlob(blob, style)
      }

      setShowSheet(false)
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setSharing(false)
    }
  }

  function downloadBlob(blob, style) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tdl-${style || 'card'}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopyLink() {
    if (linkState === 'copying') return
    setLinkState('copying')
    try {
      const res = await fetch('/api/share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id }),
      })
      if (!res.ok) throw new Error('share-link failed')
      const { slug } = await res.json()
      const url = `${window.location.origin}/share/${slug}`
      await navigator.clipboard.writeText(url)
      setLinkState('copied')
      setTimeout(() => setLinkState('idle'), 2200)
    } catch (err) {
      console.error('Copy link failed:', err)
      setLinkState('error')
      setTimeout(() => setLinkState('idle'), 2200)
    }
  }

  if (confirmingUnsave) {
    return (
      <div
        style={{
          position: 'absolute', top: 10, right: 10, background: 'var(--surface)',
          border: '0.5px solid var(--border-med)', borderRadius: 10, padding: '10px 12px',
          zIndex: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Remove from library?
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={confirmUnsave}
            style={{
              flex: 1, padding: '6px 10px', background: 'var(--surface2)', color: 'var(--text)',
              border: '0.5px solid var(--border-med)', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            Remove
          </button>
          <button
            onClick={cancelUnsave}
            style={{
              flex: 1, padding: '6px 10px', background: 'var(--accent)', color: 'var(--surface)',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            Keep
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {showSheet && (
        <ShareSheet
          card={card}
          busy={sharing}
          linkState={linkState}
          onClose={() => setShowSheet(false)}
          onExport={generateAndShare}
          onCopyLink={handleCopyLink}
        />
      )}

      <div style={{ position: 'absolute', top: 12, right: 14, display: 'flex', gap: 2, alignItems: 'center' }}>
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          title={saved ? 'Unsave' : 'Save to library'}
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'none', border: 'none',
            cursor: 'pointer', borderRadius: 4, padding: 0,
            color: saved ? 'var(--accent)' : 'var(--text-muted)',
            opacity: saving ? 0.5 : 1, transition: 'color 0.15s',
          }}
        >
          {saved ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        <button
          onClick={handleShareClick}
          disabled={sharing}
          title="Share card"
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'none', border: 'none',
            cursor: sharing ? 'wait' : 'pointer', borderRadius: 4, padding: 0,
            color: 'var(--text-muted)', opacity: sharing ? 0.5 : 1,
            transition: 'color 0.15s',
          }}
        >
          {sharing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'tdl-spin 1s linear infinite' }}>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 17" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.25"/>
              <circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.25"/>
              <circle cx="4" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.25"/>
              <path d="M10.5 3.75L5.5 7.25M10.5 12.25L5.5 8.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
