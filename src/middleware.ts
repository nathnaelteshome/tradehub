import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
const protectedRoutes = ['/checkout', '/dashboard']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
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

  // Check admin routes - only verify user is logged in
  // Role checking is done in the admin layout/page server component
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
