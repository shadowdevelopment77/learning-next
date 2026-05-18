// middleware.ts  ← root of project, NOT inside app/
import { NextRequest, NextResponse } from 'next/server'

// routes that don't need login
const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId    = request.cookies.get('session_id')?.value

  // if route is public — allow through
  const isPublic = publicRoutes.some(route => pathname.startsWith(route))
  if (isPublic) return NextResponse.next()

  // if no session cookie — redirect to login
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // session exists — allow through
  // deep validation happens in getSession() inside each route
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}