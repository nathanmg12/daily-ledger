'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Dedicated save button for the public /share/[slug] page. Deliberately
// separate from SaveShareButtons.js — that component is built for the
// in-feed card overlay (save + share + style picker together) and
// carries more UI than this page needs. This is just: save it, or
// tell me you already did.
export default function ShareSaveButton({ cardId, userId, initiallySaved }) {
  const [saved, setSaved] = useState(initiallySaved)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    if (saving || saved) return
    setSaving(true)
    const { error } = await supabase
      .from('user_saved_cards')
      .insert({ user_id: userId, card_id: cardId })
    if (!error) setSaved(true)
    setSaving(false)
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      style={{
        display: 'inline-block',
        background: saved ? 'rgba(181,130,58,0.1)' : 'var(--accent)',
        color: saved ? 'var(--accent)' : '#fff',
        border: saved ? '0.5px solid rgba(181,130,58,0.35)' : 'none',
        fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
        padding: '11px 26px', borderRadius: 8,
        cursor: saved ? 'default' : 'pointer',
        opacity: saving ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      {saved ? '✓ Saved to Library' : saving ? 'Saving…' : 'Save to Library'}
    </button>
  )
}