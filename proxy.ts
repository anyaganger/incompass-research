import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/feed/cron')
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const expected = crypto
    .createHash('sha256')
    .update((process.env.SITE_PASSWORD ?? '') + (process.env.AUTH_SECRET ?? ''))
    .digest('hex')

  if (token !== expected) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('auth-token')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
