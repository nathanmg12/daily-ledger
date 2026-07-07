'use client'

import { useState, useEffect } from 'react'

export default function AddToHomeScreenPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState(null) // 'android' | 'other'
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) return

    const dismissed = localStorage.getItem('tdl-a2hs-prompt-dismissed')
    if (dismissed) return

    setPlatform('other')
    setShow(true)

    function handleBeforeInstallPrompt(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setPlatform('android')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (!show) return null

  function dismiss() {
    localStorage.setItem('tdl-a2hs-prompt-dismissed', 'true')
    setShow(false)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    localStorage.setItem('tdl-a2hs-prompt-dismissed', 'true')
    setShow(false)
  }

  return (
    <div style={{
      position: 'relative',
      background: 'var(--surface)',
      border: '0.5px solid var(--border-med)',
      borderRadius: 10,
      padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
    }}>
      <button
        onClick={dismiss}
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          color: 'var(--text-muted)',
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
      <p style={{
        fontSize: 11,
        fontFamily: 'var(--mono)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
      }}>
        Add app to home screen
      </p>

      {platform === 'android' ? (
        <button
          onClick={handleInstall}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '10px 18px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--accent)',
            color: 'white',
          }}
        >
          Add app to home screen
        </button>
      ) : (
        <p style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
        }}>
          Open the browser menu and look for &ldquo;Add to Home Screen&rdquo; to install the app.
        </p>
      )}
    </div>
  )
}