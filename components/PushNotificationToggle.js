'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationToggle() {
  const [status, setStatus] = useState('loading') // loading, unsupported, denied, enabled, disabled
  const supabase = createClient()

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    // Check if they already have a subscription saved
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setStatus(sub ? 'enabled' : 'disabled')
      })
    })
  }, [])

  async function enable() {
    const reg = await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatus('denied')
      return
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
    })
    await fetch('/api/push-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    })
    setStatus('enabled')
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    await fetch('/api/push-subscription', { method: 'DELETE' })
    setStatus('disabled')
  }

  if (status === 'loading') return null
  if (status === 'unsupported') return (
    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
      Push notifications aren't supported on this browser.
    </p>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, fontFamily: 'var(--sans)' }}>
            Daily notification
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0', fontFamily: 'var(--sans)' }}>
            One notification a day when your feed is ready
          </p>
        </div>
        {status === 'denied' ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
            Blocked in browser settings
          </p>
        ) : (
          <button
            onClick={status === 'enabled' ? disable : enable}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: status === 'enabled' ? 'var(--accent)' : 'var(--border-med)',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: 3,
              left: status === 'enabled' ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              transition: 'left 0.2s',
            }} />
          </button>
        )}
      </div>
    </div>
  )
}