'use client'

import { useState } from 'react'
import FadeIn from '@/components/FadeIn'
import { ScriptureCard, QuoteCard, QuickFactCard, BookSummaryCard,
  FoodSpotlightCard, ResearchCard, ProtocolCard } from '@/components/cards'

const FILTER_META = [
  { label: 'All',         value: null },
  { label: 'Scripture',   value: 'scripture' },
  { label: 'Quote',       value: 'quote' },
  { label: 'Quick Facts', value: 'quick_facts' },
  { label: 'Books',       value: 'book_summary' },
  { label: 'Research',    value: 'research' },
  { label: 'Protocol',    value: 'protocol' },
  { label: 'Food',        value: 'food_spotlight' },
]

const EMPTY_MESSAGES = {
  scripture:      'No saved Scripture cards yet.',
  quote:          'No saved Quote cards yet.',
  quick_facts:    'No saved Quick Fact cards yet.',
  book_summary:   'No saved Book Summary cards yet.',
  research:       'No saved Research cards yet.',
  protocol:       'No saved Protocol cards yet.',
  food_spotlight: 'No saved Food Spotlight cards yet.',
}

export default function LibraryFeed({ cards: initialCards, userId }) {
  const [cards, setCards] = useState(initialCards)
  const [activeFilter, setActiveFilter] = useState(null)
  const savedCardIds = new Set(cards.map(c => c.id))

  function handleUnsave(cardId) {
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  const filtered = activeFilter ? cards.filter(c => c.type === activeFilter) : cards

  function renderCard(card) {
    const props = {
      card,
      savedCardIds,
      userId,
      onUnsave: () => handleUnsave(card.id),
    }
    switch (card.type) {
      case 'scripture':      return <ScriptureCard {...props} />
      case 'quote':          return <QuoteCard {...props} />
      case 'quick_facts':    return <QuickFactCard {...props} />
      case 'book_summary':   return <BookSummaryCard {...props} />
      case 'food_spotlight': return <FoodSpotlightCard {...props} />
      case 'research':       return <ResearchCard {...props} />
      case 'protocol':       return <ProtocolCard {...props} />
      default:               return null
    }
  }

  return (
    <div>
      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky', top: 52, zIndex: 50,
        background: 'rgba(240,237,232,0.97)',
        backdropFilter: 'blur(10px)',
        borderBottom: '0.5px solid var(--border-med)',
        padding: '0.75rem 0',
        marginBottom: '1.25rem',
        display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
      }}>
        {FILTER_META.map(f => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.value)}
            style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '4px 12px', borderRadius: 3,
              border: activeFilter === f.value
                ? '0.5px solid var(--accent)'
                : '0.5px solid var(--border-med)',
              background: activeFilter === f.value ? 'var(--accent-dim)' : 'var(--surface)',
              color: activeFilter === f.value ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty state for active filter */}
      {filtered.length === 0 && activeFilter && (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: '0.5rem' }}>
            {EMPTY_MESSAGES[activeFilter]}
          </p>
          <p style={{ fontSize: 13 }}>Tap the + on any card in your daily ledger to save it here.</p>
        </div>
      )}

      {/* Cards */}
      {filtered.map((card, i) => (
        <FadeIn key={card.id} delay={i * 40}>
          <div style={{ marginBottom: '0.75rem' }}>
            {renderCard(card)}
          </div>
        </FadeIn>
      ))}
    </div>
  )
}