'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Database', href: '/database' },
  { label: 'Feed', href: '/feed' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Reports', href: '/reports' },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Single row on desktop */}
        <div className="flex h-12 sm:h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Incompass Research
            </span>
            <nav className="hidden sm:flex items-center gap-0.5">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    pathname === tab.href
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-zinc-400 hover:text-zinc-600"
          >
            Sign out
          </button>
        </div>
        {/* Scrollable tab row on mobile */}
        <div className="sm:hidden -mx-4 overflow-x-auto border-t border-zinc-100">
          <nav className="flex items-center gap-0.5 px-3 py-2">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname === tab.href
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
