'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">Incompass Research</h1>
          <p className="mt-1 text-sm text-zinc-500">Intelligence platform</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-0"
            placeholder="Enter access password"
            autoFocus
            required
          />
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
