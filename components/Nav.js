'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'

const SECTION_META = {
  scripture:      { label: 'Scripture',      color: '#8a6a20' },
  quote:          { label: 'Quote',          color: '#b5823a' },
  quick_facts:    { label: 'Quick Facts',    color: '#2a8a6e' },
  book_summary:   { label: 'Book Ideas',     color: '#2e6da4' },
  food_spotlight: { label: 'Food Spotlight', color: '#b5823a' },
  research:       { label: 'Research',       color: '#2e6da4' },
  protocol:       { label: 'Protocol',       color: '#3a7a3a' },
}

// Icons as inline SVG components
function JumpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 4L6.5 7.5h5L9 4Z" fill="currentColor"/>
      <path d="M9 14L6.5 10.5h5L9 14Z" fill="currentColor"/>
      <line x1="9" y1="7.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.75" y="2.75" width="12.5" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M2.75 10.5H6L7.25 12.5H10.75L12 10.5H15.25" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M9 2.5V4M9 14V15.5M2.5 9H4M14 9H15.5M4.4 4.4L5.46 5.46M12.54 12.54L13.6 13.6M4.4 13.6L5.46 12.54M12.54 5.46L13.6 4.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  )
}

export default function Nav({ presentCardTypes = [] }) {
  const pathname = usePathname()
  const [jumpOpen, setJumpOpen] = useState(false)
  const dropdownRef = useRef(null)
  const isToday = pathname === '/today'
  const isLibrary = pathname === '/library'
  const isSettings = pathname === '/settings'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setJumpOpen(false)
      }
    }
    if (jumpOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [jumpOpen])

  function jumpTo(type) {
    setJumpOpen(false)
    const el = document.getElementById('section-' + type)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const iconBtn = (active) => ({
    width: 36, height: 36,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer',
    borderRadius: 8, padding: 0,
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    transition: 'color 0.15s',
    textDecoration: 'none',
  })

  // Only show card types present in today's feed, in the canonical order
  const jumpSections = Object.keys(SECTION_META).filter(t => presentCardTypes.includes(t))

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(240,237,232,0.97)',
      backdropFilter: 'blur(10px)',
      borderBottom: '0.5px solid var(--border-med)',
      padding: '0 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 52,
    }}>

      <Link href="/today" style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--text)', textDecoration: 'none', lineHeight: 1 }}>
        The Daily <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Ledger</em>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>

        {/* Jump — only on /today, only if there are sections */}
        {isToday && jumpSections.length > 0 && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button onClick={() => setJumpOpen(!jumpOpen)} style={iconBtn(jumpOpen)}>
              <JumpIcon />
            </button>

            {jumpOpen && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  onClick={() => setJumpOpen(false)}
                />
                {/* Dropdown */}
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--surface)', border: '0.5px solid var(--border-med)',
                  borderRadius: 10, padding: '5px 0', minWidth: 180,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)', zIndex: 110,
                }}>
                  {jumpSections.map((type, i) => {
                    const meta = SECTION_META[type]
                    const prevType = jumpSections[i - 1]
                    const showDivider = i > 0 && (
                      (prevType === 'quote' && type === 'quick_facts') ||
                      (prevType === 'book_summary' && type === 'food_spotlight')
                    )
                    return (
                      <div key={type}>
                        {showDivider && <div style={{ height: '0.5px', background: 'var(--border)', margin: '4px 14px' }} />}
                        <button
                          onClick={() => jumpTo(type)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', padding: '10px 14px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--sans)', fontSize: 13,
                            color: 'var(--text-secondary)', textAlign: 'left',
                          }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                          {meta.label}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Library */}
        <Link href="/library" style={iconBtn(isLibrary)}>
          <LibraryIcon />
        </Link>

        {/* Settings */}
        <Link href="/settings" style={iconBtn(isSettings)}>
          <SettingsIcon />
        </Link>

      </div>
    </nav>
  )
}