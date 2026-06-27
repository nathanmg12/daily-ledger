'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState('signin') // 'signin', 'signup', 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'signup' && !agreed) {
      setError('Please agree to the Privacy Policy to continue.')
      return
    }

    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a confirmation link.')
      }
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a password reset link.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        window.location.href = '/today'
      }
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
        {mode === 'signin' ? 'Sign in to your account' : mode === 'signup' ? 'Create an account' : 'Reset your password'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        {mode !== 'forgot' && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
        )}

        {mode === 'signin' && (
          <div style={{ textAlign: 'right', marginTop: -4 }}>
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--sans)' }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {mode === 'signup' && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              I agree to the{' '}
              <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                Privacy Policy
              </a>
            </span>
          </label>
        )}

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
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
        </button>
      </form>

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

      <p style={{ marginTop: 28, fontSize: 13, color: 'var(--text-secondary)' }}>
        {mode === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => { setMode('signup'); setError(''); setMessage('') }}
              style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 13, fontFamily: 'var(--sans)' }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setMode('signin'); setError(''); setMessage('') }}
              style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 13, fontFamily: 'var(--sans)' }}
            >
              Back to sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}