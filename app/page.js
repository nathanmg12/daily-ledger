import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

const CARD_TYPES = [
  {
    emoji: '📖',
    name: 'Scripture',
    color: '#8a6a20',
    bg: 'rgba(138,106,32,0.08)',
    border: 'rgba(138,106,32,0.2)',
    description: 'A verse with historical context and quiet reflection. For those who follow Scripture & Faith.',
  },
  {
    emoji: '💬',
    name: 'Quote',
    color: '#b5823a',
    bg: 'rgba(181,130,58,0.1)',
    border: 'rgba(181,130,58,0.2)',
    description: 'A single attributed quote with a story behind it. For those who follow Quotes & Wisdom.',
  },
  {
    emoji: '⚡',
    name: 'Quick Fact',
    color: '#2a8a6e',
    bg: 'rgba(42,138,110,0.08)',
    border: 'rgba(42,138,110,0.2)',
    description: 'Two surprising, well-sourced facts per topic you follow, and a link to learn more. Always something worth knowing.',
  },
  {
    emoji: '📚',
    name: 'Book Summary',
    color: '#2e6da4',
    bg: 'rgba(46,109,164,0.08)',
    border: 'rgba(46,109,164,0.2)',
    description: "Key ideas from a book relevant to your interests. Enough to decide if it's worth reading.",
  },
  {
    emoji: '🥦',
    name: 'Food Spotlight',
    color: '#8a6a20',
    bg: 'rgba(138,106,32,0.08)',
    border: 'rgba(138,106,32,0.2)',
    description: 'One food or supplement, examined honestly. What the research actually shows, plus caveats.',
  },
  {
    emoji: '🔬',
    name: 'Research',
    color: '#2e6da4',
    bg: 'rgba(46,109,164,0.08)',
    border: 'rgba(46,109,164,0.2)',
    description: 'Two peer-reviewed study summaries. The finding, the context, and why it matters.',
  },
  {
    emoji: '⚙️',
    name: 'Protocol',
    color: '#3a7a3a',
    bg: 'rgba(58,122,58,0.08)',
    border: 'rgba(58,122,58,0.2)',
    description: 'One evidence-backed habit or practice. What it is, how it works, and how to start.',
  },
]

const DIFFERENCES = [
  { label: 'No algorithm', body: 'Your feed is hand-curated and interest-based. Nothing extra is boosted, promoted, or optimized for engagement.' },
  { label: 'No ads', body: 'Your attention is not the revenue model. No companies advertise on TDL.' },
  { label: 'No opinions', body: 'Cards present information, not takes. Research, facts, and context.' },
  { label: 'No social layer', body: 'No likes, no comments, and no followers. Just you and your reading.' },
  { label: 'Finite by design', body: "Your daily ledger has a fixed number of cards. When you're done, you're done scrolling for the day." },
  { label: 'Small steps', body: 'TDL is built to promote small steps towards learning and personal growth. Small steps add up over time.' },
]

const STEPS = [
  { num: '01', title: 'Pick your topics', body: 'Choose from 14 interest categories. Your daily cards are pulled from whatever interests you choose to follow.' },
  { num: '02', title: 'Read each morning', body: 'Your ledger refreshes every day at 4am with new cards. Your cards will never repeat.' },
  { num: '03', title: 'Go live your day', body: "When you've read your cards, you're done. No infinite scrolling, no reposting. Dive deeper into what you learned, then go live your day." },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(240,237,232,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '0.5px solid var(--border-med)',
        padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--text)' }}>
          The Daily <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Ledger</em>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/login" style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-secondary)', textDecoration: 'none',
          }}>
            Sign In
          </Link>
          <Link href="/login" style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '8px 16px', borderRadius: 6,
            background: 'var(--accent)', color: 'var(--surface)', textDecoration: 'none',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: 820, margin: '0 auto', padding: '5rem 1.5rem 4rem',
        borderBottom: '0.5px solid var(--border-med)',
      }}>
        <FadeIn delay={0}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1.25rem',
          }}>
            A daily reading app
          </div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(38px, 7vw, 68px)',
            fontWeight: 400, lineHeight: 1.05, marginBottom: '1.5rem', maxWidth: 640,
          }}>
            Your calm corner<br />of the <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>internet.</em>
          </h1>
          <p style={{
            fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75,
            maxWidth: 520, marginBottom: '2rem',
          }}>
            The Daily Ledger delivers a set of cards each morning based on topics you care about. Genuinely useful information, no algorithm, no ads, no opinions. Read your ledger, then go live your day.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/login" style={{
              fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '13px 28px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--surface)', textDecoration: 'none',
              display: 'inline-block',
            }}>
              Start Reading Today
            </Link>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
              Free to start · No commitment required
            </span>
          </div>
        </FadeIn>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 1.5rem', borderBottom: '0.5px solid var(--border-med)' }}>
        <FadeIn delay={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 3, background: 'var(--accent-dim)', color: 'var(--accent)',
              border: '0.5px solid rgba(181,130,58,0.2)', whiteSpace: 'nowrap',
            }}>
              How it works
            </span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border-med)' }} />
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          {STEPS.map((step, i) => (
            <FadeIn key={step.num} delay={i * 80}>
              <div style={{
                background: 'var(--surface)', border: '0.5px solid var(--border-med)',
                borderRadius: 10, padding: '1.5rem', height: '100%',
              }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)',
                  letterSpacing: '0.08em', marginBottom: '0.75rem',
                }}>
                  {step.num}
                </div>
                <div style={{
                  fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 400,
                  color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.3,
                }}>
                  {step.title}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {step.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Card types */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 1.5rem', borderBottom: '0.5px solid var(--border-med)' }}>
        <FadeIn delay={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 3, background: 'var(--accent-dim)', color: 'var(--accent)',
              border: '0.5px solid rgba(181,130,58,0.2)', whiteSpace: 'nowrap',
            }}>
              What you will read
            </span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border-med)' }} />
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'stretch' }}>
          {CARD_TYPES.map((type, i) => (
            <FadeIn key={type.name} delay={i * 60}>
              <div style={{
                background: 'var(--surface)', border: '0.5px solid var(--border-med)',
                borderLeft: `3px solid ${type.color}`,
                borderRadius: 10, padding: '1.25rem 1.5rem', height: '100%',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: 16 }}>{type.emoji}</span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: type.color,
                  }}>
                    {type.name}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {type.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* The difference */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 1.5rem', borderBottom: '0.5px solid var(--border-med)' }}>
        <FadeIn delay={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 3, background: 'var(--accent-dim)', color: 'var(--accent)',
              border: '0.5px solid rgba(181,130,58,0.2)', whiteSpace: 'nowrap',
            }}>
              The difference
            </span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border-med)' }} />
          </div>
          <p style={{
            fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75,
            maxWidth: 560, marginBottom: '2rem',
          }}>
            TDL is designed to promote small steps towards learning and personal growth. A delivery of genuinely useful information, built differently from everything else on your phone.
          </p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', alignItems: 'stretch' }}>
          {DIFFERENCES.map((d, i) => (
            <FadeIn key={d.label} delay={i * 60}>
              <div style={{
                background: 'var(--surface)', border: '0.5px solid var(--border-med)',
                borderRadius: 10, padding: '1.25rem 1.5rem', height: '100%',
              }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem',
                }}>
                  {d.label}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {d.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* CTA footer */}
      <FadeIn delay={0}>
        <div style={{
          maxWidth: 820, margin: '0 auto', padding: '5rem 1.5rem 6rem', textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 400, lineHeight: 1.2, marginBottom: '1rem',
          }}>
            Ready to read something <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>worth reading?</em>
          </h2>
          <p style={{
            fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: 440, margin: '0 auto 2rem',
          }}>
            Free to start. Read your first ledger today.
          </p>
          <Link href="/login" style={{
            fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em',
            textTransform: 'uppercase', padding: '13px 32px', borderRadius: 8,
            background: 'var(--accent)', color: 'var(--surface)', textDecoration: 'none',
            display: 'inline-block',
          }}>
            Get Started
          </Link>
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '0.5px solid var(--border-med)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              The Daily Ledger
            </span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/privacy" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                Privacy Policy
              </Link>
              <a href="mailto:admin@thedailyledger.app" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </FadeIn>

    </div>
  )
}