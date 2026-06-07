import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/services', '/incidents', '/settings']
const AUTH_PREFIXES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // NextAuth v4 stores the session token in one of these cookies
  const sessionToken =
    request.cookies.get('next-auth.session-token') ??
    request.cookies.get('__Secure-next-auth.session-token')

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
