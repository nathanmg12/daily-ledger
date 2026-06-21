import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/today', '/settings']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')
  const isLogin = request.nextUrl.pathname === '/login'
  const isHome = request.nextUrl.pathname === '/'

  // Not logged in — redirect to login if trying to access protected pages
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Logged in — check if onboarding is complete
  if (user && (isProtected || isLogin)) {
    const { data: interests } = await supabase
      .from('user_interests')
      .select('interest_id')
      .eq('user_id', user.id)
      .limit(1)

    const hasInterests = interests && interests.length > 0

    // No interests yet — send to onboarding
    if (!hasInterests && !isOnboarding) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // Has interests but trying to access login or home — send to today
    if (hasInterests && (isLogin || isHome)) {
      const url = request.nextUrl.clone()
      url.pathname = '/today'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}