import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import LibraryFeed from '@/components/LibraryFeed'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: savedRows } = await supabase
    .from('user_saved_cards')
    .select('saved_at, cards(id, type, title, content, card_interests(interests(name)))')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  const cards = (savedRows || []).map(row => {
    if (!row.cards) return null
    const interests = row.cards.card_interests?.map(ci => ci.interests?.name).filter(Boolean) || []
    return { ...row.cards, interests }
  }).filter(Boolean)

  return (
    <>
      <Nav />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--border-med)' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 400, marginBottom: '0.4rem' }}>
            Your <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Library</em>
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {cards.length} saved card{cards.length !== 1 ? 's' : ''}
          </p>
        </div>

        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: '0.75rem' }}>Nothing saved yet.</p>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              Tap the + on any card in your daily ledger to save it here.
            </p>
          </div>
        ) : (
          <LibraryFeed cards={cards} userId={user.id} />
        )}
      </div>
    </>
  )
}