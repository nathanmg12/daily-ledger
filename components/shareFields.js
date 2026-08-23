// One budgeted view of a card, shared by every share format.
//
// Share images are teasers, not reproductions. Card content ranges from a
// 562-character quote to a 4,793-character book summary, so rendering every
// field and letting the overflow fade sort it out meant the longest and
// best-performing card types — food spotlights and book summaries — were the
// ones that shared badly. Each type instead surfaces its strongest fields and
// drops the rest, which is what lets a single set of layouts hold all seven.
//
// Every template renders whichever of these fields are present, differing only
// in typography and chrome. Adding a format should never mean writing another
// seven-branch switch.

export const ACCENT = {
  scripture:      { color: '#8a6a20', bg: 'rgba(138,106,32,0.08)',  border: 'rgba(138,106,32,0.2)' },
  quote:          { color: '#b5823a', bg: 'rgba(181,130,58,0.08)',  border: 'rgba(181,130,58,0.2)' },
  quick_facts:    { color: '#2a8a6e', bg: 'rgba(42,138,110,0.08)',  border: 'rgba(42,138,110,0.2)' },
  book_summary:   { color: '#6b52a8', bg: 'rgba(107,82,168,0.08)',  border: 'rgba(107,82,168,0.2)' },
  food_spotlight: { color: '#a07030', bg: 'rgba(160,112,48,0.08)',  border: 'rgba(160,112,48,0.2)' },
  research:       { color: '#2e6da4', bg: 'rgba(46,109,164,0.08)',  border: 'rgba(46,109,164,0.2)' },
  protocol:       { color: '#3a7a3a', bg: 'rgba(58,122,58,0.08)',   border: 'rgba(58,122,58,0.2)' },
}

// Back cards in the fanned deck — two colours that contrast with the front.
export const BACK_COLORS = {
  scripture:      ['#2e6da4', '#2a8a6e'],
  quote:          ['#3a7a3a', '#6b52a8'],
  quick_facts:    ['#6b52a8', '#2e6da4'],
  book_summary:   ['#2a8a6e', '#b85c45'],
  food_spotlight: ['#3a7a3a', '#2e6da4'],
  research:       ['#3a7a3a', '#6b52a8'],
  protocol:       ['#2e6da4', '#b85c45'],
}

export const TYPE_LABELS = {
  scripture: 'Scripture', quote: 'Quote', quick_facts: 'Quick Fact',
  book_summary: 'Book Ideas', food_spotlight: 'Food Spotlight',
  research: 'Research', protocol: 'Protocol',
}

// Circle is a round frame, so it only suits the two types short enough to sit
// in one. A food spotlight will not fit a circle at any size.
export const CIRCLE_TYPES = new Set(['scripture', 'quote'])

const trim = (s) => (typeof s === 'string' && s.trim().length ? s.trim() : null)

export function cardFields(card) {
  const c = card?.content || {}

  switch (card?.type) {
    // Quotation types set large and italic; the surrounding context is the
    // first thing to go, since it is written to be read after the verse.
    case 'scripture':
      return {
        quotation: trim(c.verse),
        attribution: trim(c.reference),
        meta: trim(c.translation),
      }
    case 'quote':
      return {
        quotation: trim(c.quote),
        attribution: trim(c.author),
        meta: trim(c.source),
      }

    // The fact is the whole card, so nothing is dropped.
    case 'quick_facts':
      return { body: trim(c.fact) }

    // The takeaway already states the finding in one sentence; tldr and body
    // restate it at length.
    case 'research':
      return {
        kicker: trim(c.title),
        body: trim(c.takeaway) || trim(c.tldr),
        meta: [trim(c.journal), c.published_at ? String(c.published_at).slice(0, 4) : null]
          .filter(Boolean).join(' · ') || null,
      }

    // How to start is the actionable line; the mechanism is a read, not a look.
    case 'protocol':
      return {
        kicker: trim(c.name),
        badges: c.evidence_level ? [`Evidence: ${c.evidence_level}`] : [],
        body: trim(c.how_to_start) || trim(c.overview),
        meta: trim(c.source),
      }

    // The bottom line is the verdict; specs, caveats and the research summary
    // are reference material.
    case 'food_spotlight':
      return {
        kicker: trim(c.name),
        badges: Array.isArray(c.badges) ? c.badges.filter(Boolean) : [],
        body: trim(c.bottom_line) || trim(c.intro),
      }

    // One idea, not five. Five never fit, and the first is the strongest.
    case 'book_summary': {
      const first = Array.isArray(c.ideas) ? c.ideas[0] : null
      return {
        kicker: trim(c.title),
        idea: trim(first?.title),
        body: trim(first?.body),
        meta: trim(c.author),
      }
    }

    default:
      return {}
  }
}

// Quotations get italic serif at display size; everything else gets roman body
// text. Templates branch on this rather than on card type.
export function isQuotation(card) {
  return card?.type === 'scripture' || card?.type === 'quote'
}
