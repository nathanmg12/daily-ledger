import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// NOTE: This route builds its own Supabase clients inline rather than
// importing from @/lib/supabase/server, matching the pattern already
// used on the seed-feed route (the standard server helper has failed
// there before). If you already have a shared cookie-based server
// client that works reliably elsewhere, feel free to swap the auth
// client below for that import instead — just keep the service client
// as-is, since the insert needs to bypass RLS-adjacent auth context
// issues the same way seed-feed does.

function slugify() {
  // 10-char base36 slug — random + time component to keep collisions rare.
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-4)
  return `${rand}${time}`
}

export async function POST(request) {
  const { card_id } = await request.json()

  if (!card_id) {
    return NextResponse.json({ error: 'card_id is required' }, { status: 400 })
  }

  // 1. Verify the requester is logged in (cookie-based session check)
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* no-op — not setting cookies from this route */ },
      },
    }
  )

  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2. Use the service client for the actual DB work
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // Reuse an existing slug if this user already shared this exact card,
  // instead of minting duplicates every time they hit "Copy link".
  const { data: existing } = await serviceClient
    .from('shared_cards')
    .select('slug')
    .eq('card_id', card_id)
    .eq('created_by', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ slug: existing.slug })
  }

  // Insert with a small retry loop in case of a slug collision
  // (unique constraint on shared_cards.slug).
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = slugify()
    const { error: insertError } = await serviceClient
      .from('shared_cards')
      .insert({ card_id, created_by: user.id, slug })

    if (!insertError) {
      return NextResponse.json({ slug })
    }
    // 23505 = unique_violation — only worth retrying on a slug collision
    if (insertError.code !== '23505') {
      console.error('share-link insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Failed to generate a unique link, try again' }, { status: 500 })
}