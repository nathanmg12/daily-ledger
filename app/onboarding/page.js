'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const MIN_INTERESTS = 3

export default function OnboardingPage() {
  const [interests, setInterests] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadInterests() {
      const { data, error } = await supabase
        .from('interests')
        .select('id, name')
        .order('name')

      if (error) {
        setError('Could not load interests. Please refresh the page.')
      } else {
        setInterests(data)
      }
      setLoading(false)
    }
    loadInterests()
  }, [])

  function toggleInterest(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function handleContinue() {
    setError('')

    if (selected.length < MIN_INTERESTS) {
      setError(`Please select at least ${MIN_INTERESTS} interests.`)
      return
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in.')
      setSaving(false)
      return
    }

    const rows = selected.map((interest_id) => ({
      user_id: user.id,
      interest_id,
    }))

    const { error: insertError } = await supabase
      .from('user_interests')
      .insert(rows)

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    // Seed today's feed immediately so new users don't see an empty state
    await fetch('/api/seed-feed', { method: 'POST' })

    window.location.href = '/today'
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem', fontFamily: 'var(--sans)', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    )
  }

  return (
<div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem 5rem', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
      {/* Hero */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.75rem', borderBottom: '0.5px solid var(--border-med)' }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(22px, 5vw, 42px)',
          fontWeight: 400, lineHeight: 1.1, marginBottom: '1.25rem'
        }}>
          Welcome. Let's build your daily <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>ledger.</em>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            'Pick at least 3 topics below',
            'Your cards are ready every morning at 4am',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)',
                letterSpacing: '0.08em', minWidth: 16,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interest selection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 3, background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '0.5px solid rgba(181,130,58,0.2)', whiteSpace: 'nowrap',
          }}>
            What would you like to read about?
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            {selected.length} selected
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', width: '100%' }}>
          {interests.map((interest) => {
            const isSelected = selected.includes(interest.id)
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: isSelected ? '0.5px solid var(--accent)' : '0.5px solid var(--border-med)',
                  background: isSelected ? 'var(--accent-dim)' : 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                  fontFamily: 'var(--sans)',
                  fontWeight: isSelected ? 500 : 300,
                  transition: 'all 0.15s',
                }}
              >
                {interest.name}
              </button>
            )
          })}
        </div>

        {error && (
          <p style={{ color: '#b85c45', marginTop: '1rem', fontSize: 13, fontFamily: 'var(--mono)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={saving}
          style={{
            marginTop: '1.5rem',
            padding: '12px 28px',
            background: 'var(--accent)',
            color: 'var(--surface)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'var(--mono)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Building your ledger...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}