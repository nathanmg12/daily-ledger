import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// NOTE: This route builds its own Supabase clients inline rather than
// importing from @/lib/supabase/server, matching the pattern already
// used on the seed-feed route (the standard server helper has failed
// there before).

const BUCKET = 'share-previews'
const MAX_PREVIEW_BYTES = 2 * 1024 * 1024

function slugify() {
  // 10-char base36 slug — random + time component to keep collisions rare.
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-4)
  return `${rand}${time}`
}

// The preview is rendered in the browser, where the share templates already
// live, and uploaded here with the service key. That keeps the storage bucket
// closed to browser writes, and avoids server-side image rendering entirely —
// which matters on Netlify, where next/og is unproven against Next 16.
async function storePreview(serviceClient, slug, file) {
  if (!file || typeof file.arrayBuffer !== 'function') return null
  if (file.size === 0 || file.size > MAX_PREVIEW_BYTES) return null

  const bytes = Buffer.from(await file.arrayBuffer())
  const path = `${slug}.png`

  const { error } = await serviceClient.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: 'image/png', upsert: true })

  if (error) {
    // A missing preview is survivable: the share page falls back to the
    // site-wide Open Graph image rather than failing the whole request.
    console.error('share preview upload failed:', error.message)
    return null
  }

  const { data } = serviceClient.storage.from(BUCKET).getPublicUrl(path)
  return data?.publicUrl || null
}

export async function POST(request) {
  // Sent as multipart so the rendered PNG rides along with the request, which
  // means the preview is stored before the caller ever sees the slug. Posting
  // the image separately would leave a window where a freshly copied link
  // unfurls with no image.
  let cardId = null
  let preview = null

  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    cardId = form.get('card_id')
    const file = form.get('preview')
    preview = typeof file === 'object' && file !== null ? file : null
  } else {
    const body = await request.json().catch(() => ({}))
    cardId = body.card_id
  }

  if (!cardId) {
    return NextResponse.json({ error: 'card_id is required' }, { status: 400 })
  }

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

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // Reuse an existing slug if this user already shared this exact card,
  // instead of minting duplicates every time they hit "Copy link".
  const { data: existing } = await serviceClient
    .from('shared_cards')
    .select('slug, og_image_url')
    .eq('card_id', cardId)
    .eq('created_by', user.id)
    .maybeSingle()

  if (existing) {
    // Backfill the preview for links created before this shipped, or where an
    // earlier upload failed. An existing image is left alone.
    if (!existing.og_image_url && preview) {
      const url = await storePreview(serviceClient, existing.slug, preview)
      if (url) {
        await serviceClient
          .from('shared_cards')
          .update({ og_image_url: url })
          .eq('slug', existing.slug)
      }
    }
    return NextResponse.json({ slug: existing.slug })
  }

  // Insert with a small retry loop in case of a slug collision
  // (unique constraint on shared_cards.slug).
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = slugify()
    const { error: insertError } = await serviceClient
      .from('shared_cards')
      .insert({ card_id: cardId, created_by: user.id, slug })

    if (!insertError) {
      const url = await storePreview(serviceClient, slug, preview)
      if (url) {
        await serviceClient.from('shared_cards').update({ og_image_url: url }).eq('slug', slug)
      }
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
