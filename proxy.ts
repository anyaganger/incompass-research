import { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/feed/cron(.*)',
])

const handler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

// Next.js 16 uses proxy.ts with a named `proxy` export instead of middleware.ts.
// Clerk's handler expects (req, event) — the event is only used for waitUntil
// telemetry, so a no-op shim is fine here.
export function proxy(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any)(req, { waitUntil: () => {} })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
