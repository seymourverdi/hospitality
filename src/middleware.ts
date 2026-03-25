import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const POS_SESSION_COOKIE = 'pos_session_v1'

// Routes that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/pin',     // PIN login endpoint
  '/api/auth/logout',
  '/api/login/users',  // User list shown on login screen (before auth)
]

// Prefixes that are always public (static assets, Next.js internals)
const PUBLIC_PREFIXES = [
  '/_next/',
  '/favicon',
  '/icons/',
  '/images/',
  '/fonts/',
]

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return true
  return false
}

function hasValidSession(request: NextRequest): boolean {
  const raw = request.cookies.get(POS_SESSION_COOKIE)?.value
  if (!raw) return false

  try {
    // Cookie is base64url-encoded JSON — just verify it parses to an object with userId
    const json = Buffer.from(raw, 'base64url').toString('utf8')
    const session = JSON.parse(json) as Record<string, unknown>
    return typeof session.userId === 'string' && session.userId.length > 0
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Check for valid session cookie
  if (!hasValidSession(request)) {
    const loginUrl = new URL('/login', request.url)
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on all routes except static files handled by Next.js automatically
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}