'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: 820,
      margin: '0 auto',
      padding: '1.25rem 1.5rem 0',
    }}>
      <Link href="/today" style={{
        fontFamily: 'var(--serif)',
        fontSize: 18,
        color: 'var(--text)',
        textDecoration: 'none',
      }}>
        The Daily <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Ledger</em>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link href="/settings" style={{
          fontFamily: 'var(--mono)',
          fontSize: 12,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
        }}>
          Settings
        </Link>
        <button
          onClick={handleLogout}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}