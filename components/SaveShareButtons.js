'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import domtoimage from 'dom-to-image-more'

// Mini thumbnail previews for the style picker
function StackThumb() {
  return (
    <div style={{ width: '100%', aspectRatio: '1', background: '#f0ede8', position: 'relative', overflow: 'hidden' }}>
      {/* Back cards */}
      <div style={{
        position: 'absolute', width: 90, height: 70,
        background: '#faf9f7', borderRadius: 4, borderLeft: '2px solid #2e6da4',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-6deg) translate(-10px, 5px)',
        opacity: 0.45, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }} />
      <div style={{
        position: 'absolute', width: 90, height: 70,
        background: '#faf9f7', borderRadius: 4, borderLeft: '2px solid #2a8a6e',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-2.5deg) translate(-5px, 2px)',
        opacity: 0.65, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }} />
      {/* Front card */}
      <div style={{
        position: 'absolute', width: 90, height: 70,
        background: '#faf9f7', borderRadius: 4, borderLeft: '3px solid #b5823a',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(1.5deg)',
        boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
        padding: '7px 8px', overflow: 'hidden',
      }}>
        <div style={{ width: '40%', height: 2, background: 'rgba(181,130,58,0.4)', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ width: '100%', height: 3, background: 'rgba(28,24,20,0.1)', borderRadius: 2, marginBottom: 3 }} />
        <div style={{ width: '85%', height: 3, background: 'rgba(28,24,20,0.1)', borderRadius: 2, marginBottom: 3 }} />
        <div style={{ width: '95%', height: 3, background: 'rgba(28,24,20,0.1)', borderRadius: 2 }} />
      </div>
      {/* Footer rule */}
      <div style={{ position: 'absolute', bottom: 14, left: 8, right: 8 }}>
        <div style={{ height: 0.5, background: 'rgba(181,130,58,0.4)', marginBottom: 5 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '45%', height: 2, background: 'rgba(28,24,20,0.12)', borderRadius: 2 }} />
          <div style={{ width: '28%', height: 2, background: 'rgba(154,144,136,0.25)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}

function PosterThumb() {
  return (
    <div style={{ width: '100%', aspectRatio: '1', background: '#f0ede8', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '14px 12px 0' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: '35%', height: 2, background: 'rgba(181,130,58,0.4)', borderRadius: 2, marginBottom: 8 }} />
        <div style={{ width: '100%', height: 3, background: 'rgba(28,24,20,0.12)', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ width: '90%', height: 3, background: 'rgba(28,24,20,0.12)', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ width: '95%', height: 3, background: 'rgba(28,24,20,0.12)', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ width: '70%', height: 3, background: 'rgba(28,24,20,0.12)', borderRadius: 2 }} />
      </div>
      <div style={{ flexShrink: 0, paddingBottom: 10 }}>
        <div style={{ height: 0.5, background: 'rgba(181,130,58,0.4)', marginBottom: 5 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '45%', height: 2, background: 'rgba(28,24,20,0.12)', borderRadius: 2 }} />
          <div style={{ width: '28%', height: 2, background: 'rgba(154,144,136,0.25)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}

export default function SaveShareButtons({ card, savedCardIds, userId, onUnsave }) {
  const [saved, setSaved] = useState(savedCardIds?.has(card.id) ?? false)
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [confirmingUnsave, setConfirmingUnsave] = useState(false)
  const [showStylePicker, setShowStylePicker] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('stack')
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
    setShowStylePicker(true)
  }

  async function generateAndShare(style) {
    setShowStylePicker(false)
    setSharing(true)

    try {
      window.dispatchEvent(new CustomEvent('tdl-share', { detail: { card, style } }))

      await document.fonts.ready
      await new Promise(r => setTimeout(r, 300))

      const container = document.getElementById('share-template-root')
      if (!container) throw new Error('Share template not found')

      container.style.visibility = 'visible'

      // Overflow fade — only for stack style
      const cardEl = container.querySelector('[data-share-card]')
      const innerEl = container.querySelector('[data-share-inner]')
      let fadeEl = null
      if (style === 'stack' && cardEl && innerEl && innerEl.scrollHeight > cardEl.clientHeight) {
        fadeEl = document.createElement('div')
        fadeEl.style.cssText = [
          'position:absolute', 'bottom:0', 'left:0', 'right:0', 'height:80px',
          'background:linear-gradient(to bottom,rgba(250,249,247,0) 0%,rgba(250,249,247,0.85) 40%,rgba(250,249,247,1) 100%)',
          'display:flex', 'align-items:flex-end', 'padding:0 22px 14px', 'pointer-events:none',
        ].join(';')
        fadeEl.innerHTML = '<span style="font-size:20px;color:#9a9088;letter-spacing:0.15em;line-height:1;">···</span>'
        cardEl.appendChild(fadeEl)
      }

      const blob = await domtoimage.toBlob(container, {
        width: 540, height: 540,
        style: { transform: 'none' },
        scale: 2,
        filter: (node) => {
          if (node.tagName === 'LINK' && node.href?.includes('fonts.googleapis.com')) return false
          return true
        },
      })

      container.style.visibility = 'hidden'
      if (fadeEl) fadeEl.remove()

      const file = new File([blob], 'tdl-card.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'The Daily Ledger' })
        } catch (err) {
          if (err.name !== 'AbortError') downloadBlob(blob)
        }
      } else {
        downloadBlob(blob)
      }
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setSharing(false)
    }
  }

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tdl-card.png'; a.click()
    URL.revokeObjectURL(url)
  }

  // Unsave confirmation
  if (confirmingUnsave) {
    return (
      <div
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'var(--surface2)', border: '0.5px solid var(--border-med)',
          borderRadius: 8, padding: '8px 10px',
          display: 'flex', flexDirection: 'column', gap: 6,
          zIndex: 10, minWidth: 160, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          You won&apos;t see this card again
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={confirmUnsave} style={{ flex: 1, padding: '5px 0', background: '#b85c45', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Remove
          </button>
          <button onClick={cancelUnsave} style={{ flex: 1, padding: '5px 0', background: 'var(--surface)', color: 'var(--text-secondary)', border: '0.5px solid var(--border-med)', borderRadius: 5, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Keep
          </button>
        </div>
      </div>
    )
  }

  // Style picker
  if (showStylePicker) {
    return (
      <div
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'var(--surface)', border: '0.5px solid var(--border-med)',
          borderRadius: 12, padding: '12px 12px 10px',
          zIndex: 20, width: 200,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>
          Share as
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {/* Stack option */}
          <div
            onClick={() => setSelectedStyle('stack')}
            style={{
              flex: 1, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              border: selectedStyle === 'stack' ? '2px solid var(--accent)' : '2px solid var(--border-med)',
              transition: 'border-color 0.15s',
            }}
          >
            <StackThumb />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.06em', textTransform: 'uppercase', color: selectedStyle === 'stack' ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center', padding: '5px 0 3px', background: 'var(--surface)' }}>
              Stack
            </div>
          </div>

          {/* Poster option */}
          <div
            onClick={() => setSelectedStyle('poster')}
            style={{
              flex: 1, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              border: selectedStyle === 'poster' ? '2px solid var(--accent)' : '2px solid var(--border-med)',
              transition: 'border-color 0.15s',
            }}
          >
            <PosterThumb />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.06em', textTransform: 'uppercase', color: selectedStyle === 'poster' ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center', padding: '5px 0 3px', background: 'var(--surface)' }}>
              Poster
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowStylePicker(false)}
            style={{
              flex: 1, padding: '7px 0', background: 'var(--surface2)',
              color: 'var(--text-muted)', border: '0.5px solid var(--border-med)',
              borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--mono)',
              fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => generateAndShare(selectedStyle)}
            style={{
              flex: 2, padding: '7px 0', background: 'var(--accent)',
              color: 'var(--surface)', border: 'none',
              borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--mono)',
              fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            Share
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', top: 12, right: 14, display: 'flex', gap: 2, alignItems: 'center' }}>
      {/* Save button */}
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

      {/* Share button */}
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
  )
}