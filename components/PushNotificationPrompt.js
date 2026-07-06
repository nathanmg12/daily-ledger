'use client'

import { useState, useEffect } from 'react'
import PushNotificationToggle from './PushNotificationToggle'

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('PushManager' in window)) return
    if (Notification.permission !== 'default') return
    const dismissed = localStorage.getItem('tdl-push-prompt-dismissed')
    if (!dismissed) setShow(true)
  }, [])

  if (!show) return null

  function dismiss() {
    localStorage.setItem('tdl-push-prompt-dismissed', 'true')
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
      <p style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Notifications
      </p>
      <PushNotificationToggle onEnabled={() => {
        localStorage.setItem('tdl-push-prompt-dismissed', 'true')
        setShow(false)
      }} />
    </div>
  )
}