'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // Supabase fires an auth state change when the reset token in the URL is consumed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated. Redirecting...')
      setTimeout(() => { window.location.href = '/today' }, 1500)
    }
    setLoading(false)
  }

  const inputStyle = {
    padding: '12px 14px',
    border: '0.5px solid var(--border-med)',
    borderRadius: 8,
    background: 'var(--surface)',
    color: 'var(--text)',
    fontFamily: 'var(--sans)',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '5rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 400, lineHeight: 1.1, marginBottom: '0.5rem' }}>
        The Daily <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Ledger</em>
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Choose a new password
      </p>

      {!ready ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
          Verifying reset link...
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 18px',
              background: 'var(--accent)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: loading ? 0.6 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Please wait...' : 'Update Password'}
          </button>
        </form>
      )}

      {error && (
        <p style={{ color: '#b85c45', marginTop: 16, fontSize: 13, fontFamily: 'var(--mono)' }}>
          {error}
        </p>
      )}
      {message && (
        <p style={{ color: '#3a7a3a', marginTop: 16, fontSize: 13, fontFamily: 'var(--mono)' }}>
          {message}
        </p>
      )}
    </div>
  )
}