import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN'
  
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAuthRoute = nextUrl.pathname.startsWith('/auth')
  const isStaffRoute = nextUrl.pathname.startsWith('/staff')
  
  if (nextUrl.pathname.startsWith('/api')) return NextResponse.next()
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/staff', nextUrl))
    }
    return NextResponse.next()
  }
  
  if (!isLoggedIn && (isAdminRoute || isStaffRoute)) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl))
  }
  
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/staff', nextUrl))
  }
  
  if (nextUrl.pathname === '/') {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login', nextUrl))
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/staff', nextUrl))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
