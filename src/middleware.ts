import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
const protectedRoutes = ['/checkout', '/dashboard']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Check if accessing auth routes while logged in
  if (authRoutes.some(route => pathname.startsWith(route)) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check if accessing protected routes without auth
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !user) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Use maybeSingle() to prevent crash on missing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, suspended')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Middleware: Profile fetch error:', error.message)
      return NextResponse.redirect(new URL('/auth/login?error=profile_error', request.url))
    }

    if (!profile) {
      console.error('Middleware: Profile missing for user:', user.id)
      return NextResponse.redirect(new URL('/auth/login?error=profile_missing', request.url))
    }

    if (profile.suspended) {
      return NextResponse.redirect(new URL('/suspended', request.url))
    }

    if (profile.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
