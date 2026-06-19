import './today.css'
import Nav from '@/components/Nav'

// Sample data for layout/styling purposes only.
// Will be replaced with a real query against `daily_feed` once
// the GitHub Actions selection pipeline is built.
const sample = {
  scripture: {
    verse: "For I know the plans I have for you\u2014this is the Lord's declaration\u2014plans for your well-being, not for disaster, to give you a future and a hope.",
    reference: "Jeremiah 29:11",
    translation: "CSB",
    context: "This verse gets quoted often at graduations and in hard seasons, but the original audience was a community in exile, people who had lost their homes and their temple. The promise wasn't an immediate reversal. It was a call to keep building a life while trusting a longer arc than they could see.",
  },
  quote: {
    quote: "You have power over your mind, not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    source: "Meditations",
    context: "Aurelius wrote this while running an empire during a plague and fighting wars on multiple fronts. The discipline of the page mirrored the discipline he was asking of himself every day.",
  },
  quickFacts: [
    {
      fact: "The human gut contains roughly 100 trillion bacteria, about 10 times more microbial cells than human cells in the body. Researchers now describe it as a second nervous system with its own network of neurons.",
      search_prompt: "How does gut bacteria affect mood and mental health?",
    },
    {
      fact: "Compound interest doubles a sum roughly every 72 months at 1% monthly growth, a rule of thumb known as the Rule of 72. At 8% annual returns, an investment doubles roughly every 9 years.",
      search_prompt: "How does the Rule of 72 work for investing?",
    },
  ],
  books: [
    {
      title: "Atomic Habits",
      author: "James Clear",
      cover_emoji: "\u25C8",
      search_prompt: "Atomic Habits James Clear",
      ideas: [
        {
          number: "01",
          title: "Small habits compound the same way money does",
          body: "A 1% improvement each day doesn't feel like much in the moment, but compounded over a year it produces a result 37 times better than where you started. The gap between good and bad habits only becomes visible after a long delay, which is exactly why most people give up too early.",
        },
        {
          number: "02",
          title: "Identity change drives behavior change, not the other way around",
          body: "Clear argues most people set goals around what they want to achieve, but lasting change comes from deciding who you want to become first. Someone who sees themselves as a runner doesn't need motivation to go for a run. The behavior follows the identity.",
        },
      ],
    },
  ],
  food: {
    name: "Raw Honey",
    badges: ["Ancient food", "Evidence: Strong"],
    intro: "Honey has been part of the human diet for at least 8,000 years, with cave paintings in Spain depicting people harvesting wild hives. Most of what's sold as honey today looks almost nothing like what people were eating for millennia.",
    specs: {
      type: "Whole, unprocessed food",
      human_use: "8,000+ years",
      key_compounds: "Enzymes, polyphenols, propolis",
    },
    what_research_shows: "Raw honey has a legitimate antimicrobial track record. Its hydrogen peroxide content, low pH, and high sugar concentration create an environment most bacteria can't survive in, which is why it has been used on wounds for thousands of years.",
    caveats: "Honey is still roughly 80% sugar by weight. Never give raw honey to infants under 12 months due to botulism risk, and \"raw\" isn't a regulated term in most countries.",
    bottom_line: "If you're going to use a sweetener, raw honey from a trusted source is one of the more defensible whole-food options, with active compounds that refined sugar simply doesn't have.",
  },
  research: [
    {
      title: "Lifting weights twice a week grows the memory center of your brain",
      journal: "Nature Neuroscience",
      published_at: "2026-05-30",
      tldr: "A meta-analysis of 22 trials and over 4,000 participants found resistance training at least twice weekly produced measurable growth in hippocampal volume over 6 months.",
      body: "The hippocampus is the brain region most tied to memory and most vulnerable to Alzheimer's disease. Aerobic exercise showed benefits too, but through different pathways, suggesting the two work best in combination.",
      takeaway: "Strength training for brain health deserves the same attention we give aerobic exercise.",
    },
  ],
  protocol: {
    name: "Morning Sunlight Exposure",
    source: "Huberman Lab",
    evidence_level: "strong",
    overview: "Getting outside and exposing your eyes to natural light within 30 to 60 minutes of waking sets off a cascade of effects on sleep, mood, and energy that costs nothing and takes minutes.",
    specs: {
      timing: "Within 60 min of waking",
      duration: "10\u201330 min outdoors",
      cost: "Free",
    },
    how_it_works: "Light entering the eyes hits specialized retinal cells that signal the suprachiasmatic nucleus, the brain's master clock, that day has begun. This sets a timer that triggers melatonin release roughly 12 to 14 hours later, improving sleep onset and quality.",
    how_to_start: "Walk outside within an hour of waking, no sunglasses. On a clear day, 10 minutes is enough. On an overcast day, go for 20 to 30.",
  },
}

const TAG_COLORS = {
  scripture: { bg: "rgba(138,106,32,0.1)", color: "var(--gold)", border: "rgba(138,106,32,0.25)" },
  quote: { bg: "var(--accent-dim)", color: "var(--accent)", border: "rgba(181,130,58,0.2)" },
  quickFacts: { bg: "rgba(42,138,110,0.08)", color: "var(--teal)", border: "rgba(42,138,110,0.2)" },
  books: { bg: "rgba(46,109,164,0.08)", color: "var(--blue)", border: "rgba(46,109,164,0.2)" },
  food: { bg: "var(--accent-dim)", color: "var(--accent)", border: "rgba(181,130,58,0.2)" },
  research: { bg: "rgba(46,109,164,0.08)", color: "var(--blue)", border: "rgba(46,109,164,0.2)" },
  protocol: { bg: "rgba(58,122,58,0.08)", color: "var(--green)", border: "rgba(58,122,58,0.2)" },
}

function SectionHeader({ tag, label, count }) {
  const c = TAG_COLORS[tag]
  return (
    <div className="tdl-section-header">
      <span
        className="tdl-section-tag"
        style={{ background: c.bg, color: c.color, border: `0.5px solid ${c.border}` }}
      >
        {label}
      </span>
      <div className="tdl-section-line" />
      <span className="tdl-section-count">{count}</span>
    </div>
  )
}

function searchUrl(prompt) {
  return `https://www.google.com/search?q=${encodeURIComponent(prompt)}`
}

export default function TodayPage() {
  const today = new Date()
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const totalCards =
    1 + 1 + sample.quickFacts.length + sample.books.length + 1 + sample.research.length + 1
  // scripture + quote + quick facts + books + food + research + protocol

  const topicCount = 5 // placeholder until real interest data is wired in

  const minRead = Math.max(3, Math.round(totalCards * 1.2))
return (
    <>
      <Nav />
      <div className="tdl-page">
      {/* Hero */}
      <div className="tdl-hero">
        <div className="tdl-hero-top">
          <h1 className="tdl-hero-title">
            The Daily<br /><em>Ledger</em>
          </h1>
          <div className="tdl-hero-edition">
            <span className="tdl-hero-edition-num">No. 001</span>
            <span className="tdl-hero-edition-date">{dateStr}</span>
          </div>
        </div>
<div className="tdl-stats-row">
          <div className="tdl-stat">
            <span className="tdl-stat-num">{totalCards}</span>
            <span className="tdl-stat-label">Cards today</span>
          </div>
          <div className="tdl-stat-divider" />
          <div className="tdl-stat">
            <span className="tdl-stat-num">{topicCount}</span>
            <span className="tdl-stat-label">Topics</span>
          </div>
          <div className="tdl-stat-divider" />
          <div className="tdl-stat">
            <span className="tdl-stat-num">~{minRead}</span>
            <span className="tdl-stat-label">Min read</span>
          </div>
        </div>
      </div>

      {/* Scripture */}
      <div className="tdl-verse-block">
        <div className="tdl-verse-eyebrow">Scripture</div>
        <p className="tdl-verse-text">&ldquo;{sample.scripture.verse}&rdquo;</p>
        <div className="tdl-verse-ref">{sample.scripture.reference} · {sample.scripture.translation}</div>
        <p className="tdl-verse-reflection">{sample.scripture.context}</p>
      </div>

      {/* Quote */}
      <div className="tdl-quote-block">
        <div className="tdl-quote-eyebrow">Quote</div>
        <p className="tdl-quote-text">&ldquo;{sample.quote.quote}&rdquo;</p>
        <div className="tdl-quote-attribution">
          — {sample.quote.author}{sample.quote.source ? ` · ${sample.quote.source}` : ""}
        </div>
        <p className="tdl-quote-reflection">{sample.quote.context}</p>
      </div>

      {/* Quick Facts */}
      <div className="tdl-section">
        <SectionHeader tag="quickFacts" label="Quick Facts" count={`${sample.quickFacts.length} facts`} />
        <div className="tdl-qf-grid">
          {sample.quickFacts.map((qf, i) => (
            <div className="tdl-qf-card" key={i}>
              <div className="tdl-qf-eyebrow">Quick Fact</div>
              <p className="tdl-qf-fact">{qf.fact}</p>
              <a className="tdl-qf-search" href={searchUrl(qf.search_prompt)} target="_blank" rel="noreferrer">
                {qf.search_prompt}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Books */}
      <div className="tdl-section">
        <SectionHeader tag="books" label="Book Ideas" count={`${sample.books.length} book${sample.books.length !== 1 ? "s" : ""}`} />
        {sample.books.map((book, i) => (
          <div className="tdl-book-card" key={i}>
            <div className="tdl-book-header">
              <div className="tdl-book-spine">{book.cover_emoji}</div>
              <div>
                <div className="tdl-book-title">{book.title}</div>
                <div className="tdl-book-author">{book.author}</div>
              </div>
            </div>
            <div className="tdl-book-ideas">
              <div className="tdl-ideas-label">{book.ideas.length} ideas from this book</div>
              {book.ideas.map((idea) => (
                <div className="tdl-idea" key={idea.number}>
                  <div className="tdl-idea-num">{idea.number} /</div>
                  <div className="tdl-idea-title">{idea.title}</div>
                  <div className="tdl-idea-body">{idea.body}</div>
                </div>
              ))}
            </div>
            <a className="tdl-book-footer" href={searchUrl(book.search_prompt)} target="_blank" rel="noreferrer">
              {book.search_prompt}
            </a>
          </div>
        ))}
      </div>

      {/* Food Spotlight */}
      <div className="tdl-section">
        <SectionHeader tag="food" label="Food Spotlight" count={`Today: ${sample.food.name}`} />
        <div className="tdl-food-card">
          <div className="tdl-food-header">
            <div className="tdl-food-name">{sample.food.name}</div>
            <div className="tdl-food-badges">
              {sample.food.badges.map((b) => (
                <span className="tdl-food-badge" key={b}>{b}</span>
              ))}
            </div>
          </div>
          <div className="tdl-food-body">
            <p className="tdl-food-intro">{sample.food.intro}</p>
            <div className="tdl-food-specs">
              {Object.entries(sample.food.specs).map(([k, v]) => (
                <div className="tdl-spec" key={k}>
                  <div className="tdl-spec-label">{k.replace(/_/g, " ")}</div>
                  <div className="tdl-spec-value">{v}</div>
                </div>
              ))}
            </div>
            <div className="tdl-food-section-label">What the research shows</div>
            <p className="tdl-food-text">{sample.food.what_research_shows}</p>
            <div className="tdl-food-section-label">Caveats</div>
            <p className="tdl-food-text">{sample.food.caveats}</p>
            <div className="tdl-food-verdict">
              <div className="tdl-food-verdict-label">Bottom line</div>
              <p>{sample.food.bottom_line}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Research */}
      <div className="tdl-section">
        <SectionHeader tag="research" label="Research Spotlight" count={`${sample.research.length} paper${sample.research.length !== 1 ? "s" : ""}`} />
        {sample.research.map((r, i) => (
          <div className="tdl-research-card" key={i}>
            <div className="tdl-research-journal">{r.journal} · Published {r.published_at}</div>
            <div className="tdl-research-title">{r.title}</div>
            <span className="tdl-research-tldr">TL;DR</span>
            <div className="tdl-research-body">{r.tldr}</div>
            <div className="tdl-research-body">{r.body}</div>
            <div className="tdl-research-why">{r.takeaway}</div>
          </div>
        ))}
      </div>

      {/* Protocol */}
      <div className="tdl-section">
        <SectionHeader tag="protocol" label="Protocol Spotlight" count={`Today: ${sample.protocol.name}`} />
        <div className="tdl-protocol-card">
          <div className="tdl-protocol-header">
            <div className="tdl-protocol-name">{sample.protocol.name}</div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="tdl-protocol-badge">Evidence: {sample.protocol.evidence_level}</span>
              <span className="tdl-protocol-source">Source: {sample.protocol.source}</span>
            </div>
          </div>
          <div className="tdl-protocol-body">
            <p className="tdl-protocol-overview">{sample.protocol.overview}</p>
            <div className="tdl-protocol-specs">
              {Object.entries(sample.protocol.specs).map(([k, v]) => (
                <div className="tdl-spec" key={k}>
                  <div className="tdl-spec-label">{k.replace(/_/g, " ")}</div>
                  <div className="tdl-spec-value">{v}</div>
                </div>
              ))}
            </div>
            <p className="tdl-protocol-science">{sample.protocol.how_it_works}</p>
            <div className="tdl-protocol-action">
              <div className="tdl-protocol-action-label">How to start tomorrow</div>
              <p>{sample.protocol.how_to_start}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}