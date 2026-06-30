'use client'

import { useState, useEffect } from 'react'
import PushNotificationToggle from './PushNotificationToggle'

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('PushManager' in window)) return
    if (Notification.permission !== 'default') return
    // Only show if they haven't dismissed it before
    const dismissed = localStorage.getItem('tdl-push-prompt-dismissed')
    if (!dismissed) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border-med)',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
    }}>
      <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--sans)', marginBottom: 4 }}>
        Get a daily nudge
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--sans)', marginBottom: '1rem', lineHeight: 1.6 }}>
        One notification a day when your Ledger is ready. Nothing more.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PushNotificationToggle />
        <button
          onClick={() => {
            localStorage.setItem('tdl-push-prompt-dismissed', 'true')
            setShow(false)
          }}
          style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}
        >
          No thanks
        </button>
      </div>
    </div>
  )
}