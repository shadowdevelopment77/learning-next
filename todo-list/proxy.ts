// middleware.ts  ← root of project, NOT inside app/
import { NextRequest, NextResponse } from 'next/server'

// routes that don't need login
const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register','/api/auth/me']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId    = request.cookies.get('session_id')?.value

  // if route is public — allow through
  const isPublic = publicRoutes.some(route => pathname.startsWith(route))
  if (isPublic) return NextResponse.next()

  // if no session cookie — redirect to login
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const res = await fetch(new URL('/api/auth/me', request.url), {
      headers: {
        cookie: `session_id=${sessionId}`,  // forward the cookie
      },
    })

    if (!res.ok) {
      // session invalid or expired → clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session_id')
      return response
    }

    return NextResponse.next()

  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}