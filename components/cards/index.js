'use client'

import SaveShareButtons from '@/components/SaveShareButtons'

export const TAG_COLORS = {
  scripture:      { bg: 'rgba(138,106,32,0.1)',  color: 'var(--gold)',   border: 'rgba(138,106,32,0.25)' },
  quote:          { bg: 'var(--accent-dim)',       color: 'var(--accent)', border: 'rgba(181,130,58,0.2)' },
  quick_facts:    { bg: 'rgba(42,138,110,0.08)',  color: 'var(--teal)',   border: 'rgba(42,138,110,0.2)' },
  book_summary:   { bg: 'rgba(46,109,164,0.08)',  color: 'var(--blue)',   border: 'rgba(46,109,164,0.2)' },
  food_spotlight: { bg: 'var(--accent-dim)',       color: 'var(--accent)', border: 'rgba(181,130,58,0.2)' },
  research:       { bg: 'rgba(46,109,164,0.08)',  color: 'var(--blue)',   border: 'rgba(46,109,164,0.2)' },
  protocol:       { bg: 'rgba(58,122,58,0.08)',   color: 'var(--green)',  border: 'rgba(58,122,58,0.2)' },
}

export const INTEREST_COLORS = {
  'Business & Entrepreneurship': { bg: 'rgba(184,92,69,0.08)',  color: '#b85c45', border: 'rgba(184,92,69,0.2)' },
  'Fashion & Style':             { bg: 'rgba(107,82,168,0.08)', color: '#6b52a8', border: 'rgba(107,82,168,0.2)' },
  'Fitness & Health':            { bg: 'rgba(58,122,58,0.08)',  color: '#3a7a3a', border: 'rgba(58,122,58,0.2)' },
  'Food & Nutrition':            { bg: 'rgba(138,106,32,0.08)', color: '#8a6a20', border: 'rgba(138,106,32,0.2)' },
  'Home & Design':               { bg: 'rgba(160,112,48,0.08)', color: '#a07030', border: 'rgba(160,112,48,0.2)' },
  'Marketing & Branding':        { bg: 'rgba(184,92,69,0.08)',  color: '#b85c45', border: 'rgba(184,92,69,0.2)' },
  'Outdoors & Nature':           { bg: 'rgba(58,122,58,0.08)',  color: '#3a7a3a', border: 'rgba(58,122,58,0.2)' },
  'Personal Finance':            { bg: 'rgba(160,112,48,0.08)', color: '#a07030', border: 'rgba(160,112,48,0.2)' },
  'Philosophy & Stoicism':       { bg: 'rgba(107,82,168,0.08)', color: '#6b52a8', border: 'rgba(107,82,168,0.2)' },
  'Psychology & Behavior':       { bg: 'rgba(107,82,168,0.08)', color: '#6b52a8', border: 'rgba(107,82,168,0.2)' },
  'Quotes & Wisdom':             { bg: 'rgba(181,130,58,0.1)',  color: '#b5823a', border: 'rgba(181,130,58,0.2)' },
  'Science & Technology':        { bg: 'rgba(46,109,164,0.08)', color: '#2e6da4', border: 'rgba(46,109,164,0.2)' },
  'Scripture & Faith':           { bg: 'rgba(138,106,32,0.08)', color: '#8a6a20', border: 'rgba(138,106,32,0.2)' },
  'Sleep & Recovery':            { bg: 'rgba(46,109,164,0.08)', color: '#2e6da4', border: 'rgba(46,109,164,0.2)' },
}

export const DEFAULT_COLOR = { bg: 'var(--surface2)', color: 'var(--text-muted)', border: 'var(--border-med)' }

export function getInterestColor(interests) {
  if (!interests?.length) return DEFAULT_COLOR
  return INTEREST_COLORS[interests[0]] || DEFAULT_COLOR
}

export function searchUrl(prompt) {
  return `https://www.google.com/search?q=${encodeURIComponent(prompt)}`
}

export function InterestTags({ interests }) {
  if (!interests?.length) return null
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', paddingRight: '72px' }}>
      {interests.map((name) => {
        const c = INTEREST_COLORS[name] || DEFAULT_COLOR
        return (
          <span key={name} style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3,
            background: c.bg, color: c.color, border: `0.5px solid ${c.border}`,
          }}>
            {name}
          </span>
        )
      })}
    </div>
  )
}

export function SectionHeader({ tag, label, count }) {
  const c = TAG_COLORS[tag]
  return (
    <div className="tdl-section-header">
      <span className="tdl-section-tag" style={{ background: c.bg, color: c.color, border: `0.5px solid ${c.border}` }}>
        {label}
      </span>
      <div className="tdl-section-line" />
      <span className="tdl-section-count">{count}</span>
    </div>
  )
}

export function ScriptureCard({ card, savedCardIds, userId, onUnsave }) {
  const c = card.content
  const color = getInterestColor(card.interests)
  return (
    <div className="tdl-verse-block" style={{ borderLeftColor: color.color, position: 'relative' }}>
      <SaveShareButtons card={card} savedCardIds={savedCardIds} userId={userId} onUnsave={onUnsave} />
      <InterestTags interests={card.interests} />
      <div className="tdl-verse-eyebrow" style={{ color: color.color }}>Scripture</div>
      <p className="tdl-verse-text">&ldquo;{c.verse}&rdquo;</p>
      <div className="tdl-verse-ref" style={{ color: color.color }}>{c.reference} · {c.translation}</div>
      <p className="tdl-verse-reflection">{c.context}</p>
    </div>
  )
}

export function QuoteCard({ card, savedCardIds, userId, onUnsave }) {
  const c = card.content
  const color = getInterestColor(card.interests)
  return (
    <div className="tdl-quote-block" style={{ borderLeftColor: color.color, position: 'relative' }}>
      <SaveShareButtons card={card} savedCardIds={savedCardIds} userId={userId} onUnsave={onUnsave} />
      <InterestTags interests={card.interests} />
      <div className="tdl-quote-eyebrow" style={{ color: color.color }}>Quote</div>
      <p className="tdl-quote-text">&ldquo;{c.quote}&rdquo;</p>
      <div className="tdl-quote-attribution" style={{ color: color.color }}>
        — {c.author}{c.source ? ` · ${c.source}` : ''}
      </div>
      <p className="tdl-quote-reflection">{c.context}</p>
    </div>
  )
}

export function QuickFactCard({ card, savedCardIds, userId, onUnsave }) {
  const c = card.content
  const color = getInterestColor(card.interests)
  return (
    <div className="tdl-qf-card" style={{ borderLeftColor: color.color, position: 'relative' }}>
      <SaveShareButtons card={card} savedCardIds={savedCardIds} userId={userId} onUnsave={onUnsave} />
      <InterestTags interests={card.interests} />
      <div className="tdl-qf-eyebrow" style={{ color: color.color }}>Quick Fact</div>
      <p className="tdl-qf-fact">{c.fact}</p>
      {c.search_prompt && (
        <a className="tdl-qf-search" href={searchUrl(c.search_prompt)} target="_blank" rel="noreferrer" style={{ color: color.color }}>
          {c.search_prompt}
        </a>
      )}
    </div>
  )
}

export function BookSummaryCard({ card, savedCardIds, userId, onUnsave }) {
  const c = card.content
  const color = getInterestColor(card.interests)
  return (
    <div className="tdl-book-card" style={{ borderLeft: `3px solid ${color.color}`, position: 'relative' }}>
      <div style={{ padding: '0.75rem 1.5rem 0' }}>
        <SaveShareButtons card={card} savedCardIds={savedCardIds} userId={userId} onUnsave={onUnsave} />
        <InterestTags interests={card.interests} />
      </div>
      <div className="tdl-book-header">
        <div className="tdl-book-spine" style={{ background: color.bg, border: `0.5px solid ${color.border}` }}>
          {c.cover_emoji || '◈'}
        </div>
        <div>
          <div className="tdl-book-title">{c.title}</div>
          <div className="tdl-book-author">{c.author}</div>
        </div>
      </div>
      <div className="tdl-book-ideas">
        <div className="tdl-ideas-label">{c.ideas?.length} ideas from this book</div>
        {c.ideas?.map((idea, i) => (
          <div className="tdl-idea" key={i}>
            <div className="tdl-idea-num">{String(i + 1).padStart(2, '0')} /</div>
            <div className="tdl-idea-title">{idea.title}</div>
            <div className="tdl-idea-body">{idea.body}</div>
          </div>
        ))}
      </div>
      {c.search_prompt && (
        <a className="tdl-book-footer" href={searchUrl(c.search_prompt)} target="_blank" rel="noreferrer" style={{ color: color.color }}>
          {c.search_prompt}
        </a>
      )}
    </div>
  )
}

export function FoodSpotlightCard({ card, savedCardIds, userId, onUnsave }) {
  const c = card.content
  const color = getInterestColor(card.interests)
  return (
    <div className="tdl-food-card" style={{ borderLeft: `3px solid ${color.color}`, position: 'relative' }}>
      <div style={{ padding: '0.75rem 1.5rem 0' }}>
        <SaveShareButtons card={card} savedCardIds={savedCardIds} userId={userId} onUnsave={onUnsave} />
        <InterestTags interests={card.interests} />
      </div>
      <div className="tdl-food-header">
        <div className="tdl-food-name">{c.name}</div>
        <div className="tdl-food-badges">
          {c.badges?.map((b) => (
            <span className="tdl-food-badge" key={b}>{b}</span>
          ))}
        </div>
      </div>
      <div className="tdl-food-body">
        <p className="tdl-food-intro">{c.intro}</p>
        {c.specs && (
          <div className="tdl-food-specs">
            {Object.entries(c.specs).map(([k, v]) => (
              <div className="tdl-spec" key={k}>
                <div className="tdl-spec-label">{k.replace(/_/g, ' ')}</div>
                <div className="tdl-spec-value">{v}</div>
              </div>
            ))}
          </div>
        )}
        {c.what_research_shows && (
          <>
            <div className="tdl-food-section-label">What the research shows</div>
            <p className="tdl-food-text">{c.what_research_shows}</p>
          </>
        )}
        {c.caveats && (
          <>
            <div className="tdl-food-section-label">Caveats</div>
            <p className="tdl-food-text">{c.caveats}</p>
          </>
        )}
        {c.bottom_line && (
          <div className="tdl-food-verdict">
            <div className="tdl-food-verdict-label">Bottom line</div>
            <p>{c.bottom_line}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ResearchCard({ card, savedCardIds, userId, onUnsave }) {
  const c = card.content
  const color = getInterestColor(card.interests)
  return (
    <div className="tdl-research-card" style={{ borderLeft: `3px solid ${color.color}`, position: 'relative' }}>
      <SaveShareButtons card={card} savedCardIds={savedCardIds} userId={userId} onUnsave={onUnsave} />
      <InterestTags interests={card.interests} />
      <div className="tdl-research-journal" style={{ color: color.color }}>
        {c.journal}{c.published_at ? ` · Published ${c.published_at}` : ''}
      </div>
      <div className="tdl-research-title">{c.title}</div>
      <span className="tdl-research-tldr" style={{ color: color.color }}>TL;DR</span>
      <div className="tdl-research-body">{c.tldr}</div>
      {c.body && <div className="tdl-research-body">{c.body}</div>}
      {c.takeaway && <div className="tdl-research-why">{c.takeaway}</div>}
    </div>
  )
}

export function ProtocolCard({ card, savedCardIds, userId, onUnsave }) {
  const c = card.content
  const color = getInterestColor(card.interests)
  return (
    <div className="tdl-protocol-card" style={{ borderLeft: `3px solid ${color.color}`, position: 'relative' }}>
      <div style={{ padding: '0.75rem 1.5rem 0' }}>
        <SaveShareButtons card={card} savedCardIds={savedCardIds} userId={userId} onUnsave={onUnsave} />
        <InterestTags interests={card.interests} />
      </div>
      <div className="tdl-protocol-header">
        <div className="tdl-protocol-name">{c.name}</div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {c.evidence_level && <span className="tdl-protocol-badge">Evidence: {c.evidence_level}</span>}
          {c.source && <span className="tdl-protocol-source">Source: {c.source}</span>}
        </div>
      </div>
      <div className="tdl-protocol-body">
        <p className="tdl-protocol-overview">{c.overview}</p>
        {c.specs && (
          <div className="tdl-protocol-specs">
            {Object.entries(c.specs).map(([k, v]) => (
              <div className="tdl-spec" key={k}>
                <div className="tdl-spec-label">{k.replace(/_/g, ' ')}</div>
                <div className="tdl-spec-value">{v}</div>
              </div>
            ))}
          </div>
        )}
        {c.how_it_works && <p className="tdl-protocol-science">{c.how_it_works}</p>}
        {c.how_to_start && (
          <div className="tdl-protocol-action">
            <div className="tdl-protocol-action-label">How to start tomorrow</div>
            <p>{c.how_to_start}</p>
          </div>
        )}
      </div>
    </div>
  )
}