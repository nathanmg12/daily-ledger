'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'

const MIN_INTERESTS = 3

export default function SettingsPage() {
  const [interests, setInterests] = useState([])
  const [selected, setSelected] = useState([])
  const [originalSelected, setOriginalSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in.')
        setLoading(false)
        return
      }

      const { data: allInterests, error: interestsError } = await supabase
        .from('interests')
        .select('id, name')
        .order('name')

      const { data: userInterests, error: userInterestsError } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', user.id)

      if (interestsError || userInterestsError) {
        setError('Could not load your preferences. Please refresh the page.')
      } else {
        setInterests(allInterests)
        const currentIds = userInterests.map((row) => row.interest_id)
        setSelected(currentIds)
        setOriginalSelected(currentIds)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  function toggleInterest(id) {
    setSuccess('')
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    setError('')
    setSuccess('')

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

    const toAdd = selected.filter((id) => !originalSelected.includes(id))
    const toRemove = originalSelected.filter((id) => !selected.includes(id))

    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id)
        .in('interest_id', toRemove)

      if (deleteError) {
        setError(deleteError.message)
        setSaving(false)
        return
      }
    }

    if (toAdd.length > 0) {
      const rows = toAdd.map((interest_id) => ({ user_id: user.id, interest_id }))
      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(rows)

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
    }

    setOriginalSelected(selected)
    setSuccess('Your preferences have been saved.')
    setSaving(false)
  }

  const hasChanges = JSON.stringify([...selected].sort()) !== JSON.stringify([...originalSelected].sort())

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem', fontFamily: 'var(--sans)', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Nav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

      <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '0.5px solid var(--border-med)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Your <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Settings</em>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560 }}>
          Adjust the topics you follow. Changes apply to your next daily ledger.
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 3, background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '0.5px solid rgba(181,130,58,0.2)', whiteSpace: 'nowrap'
          }}>
            Your topics
          </span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--border-med)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {selected.length} selected
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
          {interests.map((interest) => {
            const isSelected = selected.includes(interest.id)
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  border: isSelected ? '0.5px solid var(--accent)' : '0.5px solid var(--border-med)',
                  background: isSelected ? 'var(--accent-dim)' : 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
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
        {success && (
          <p style={{ color: '#3a7a3a', marginTop: '1rem', fontSize: 13, fontFamily: 'var(--mono)' }}>
            {success}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          style={{
            marginTop: '1.5rem',
            padding: '12px 28px',
            background: hasChanges ? 'var(--accent)' : 'var(--surface2)',
            color: hasChanges ? 'var(--surface)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 8,
            cursor: hasChanges ? 'pointer' : 'default',
            fontSize: 13,
            fontFamily: 'var(--mono)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
   </div>
    </>
  )
}