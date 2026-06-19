'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Format = 'linkedin' | 'newsletter' | 'article'

const FORMATS: { value: Format; label: string; description: string; length: string }[] = [
  {
    value: 'linkedin',
    label: 'LinkedIn Post',
    description: 'Data-backed post for Nechama to publish directly',
    length: '150–250 words',
  },
  {
    value: 'newsletter',
    label: 'Newsletter',
    description: 'PE Talent Intelligence newsletter issue with subject line',
    length: '450–650 words',
  },
  {
    value: 'article',
    label: 'Thought Leadership',
    description: "Byline-ready article framing Incompass's PE white space",
    length: '700–950 words',
  },
]

const AUDIENCES = [
  { value: 'all', label: 'All audiences' },
  { value: 'pe_firms', label: 'PE Firms' },
  { value: 'c_suite', label: 'C-Suite' },
  { value: 'hr', label: 'HR Leaders' },
]

type Source = {
  id: string
  finding: string
  source_firm: string
  published_year: number | null
  report_url: string | null
}

export default function ContentPage() {
  const [format, setFormat] = useState<Format>('linkedin')
  const [angle, setAngle] = useState('')
  const [audience, setAudience] = useState('all')
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setGenerating(true)
    setDraft(null)
    setSources([])
    setError(null)
    setCopied(false)

    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, angle: angle.trim() || undefined, audience }),
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
    } else {
      setDraft(data.draft ?? null)
      setSources(data.sources ?? [])
    }
    setGenerating(false)
  }

  function copy() {
    if (!draft) return
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedFormat = FORMATS.find((f) => f.value === format)!

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Content Pipeline</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Turn database findings into publish-ready drafts — LinkedIn posts, newsletters, thought leadership — sourced from real data with citations.
        </p>
      </div>

      {/* Config panel */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 space-y-6">

        {/* Format */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Content type</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  format === f.value
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <p className={`text-sm font-medium ${format === f.value ? 'text-white' : 'text-zinc-800'}`}>
                  {f.label}
                </p>
                <p className={`mt-1 text-xs ${format === f.value ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {f.description}
                </p>
                <p className={`mt-2 text-xs tabular-nums ${format === f.value ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {f.length}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Angle + audience */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Narrative angle <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <Input
              placeholder={
                format === 'linkedin'
                  ? 'e.g. Cost of CEO mis-hire in PE-backed companies'
                  : format === 'newsletter'
                  ? 'e.g. Why HR tools fail PE at every stage of the hold period'
                  : 'e.g. Bias in talent decisions is destroying portco value'
              }
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
            />
            <p className="mt-1 text-xs text-zinc-400">
              Leave blank — the AI picks the strongest angle from your database.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Target audience</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    audience === a.value
                      ? 'border-zinc-800 bg-zinc-800 text-white'
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={generate}
            disabled={generating}
            className="bg-zinc-900 text-white hover:bg-zinc-700"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Drafting {selectedFormat.label}…
              </span>
            ) : (
              `Generate ${selectedFormat.label}`
            )}
          </Button>
          {draft && (
            <p className="text-xs text-zinc-400">
              Sourced from {sources.length} database finding{sources.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Draft output */}
      {draft && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
              <p className="text-sm font-medium text-zinc-700">
                {selectedFormat.label} draft
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={generate}
                  disabled={generating}
                  className="text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-40"
                >
                  Regenerate
                </button>
                <button
                  onClick={copy}
                  className="rounded bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="px-5 py-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-800">
                {draft}
              </pre>
            </div>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-5 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Findings pulled from database
              </p>
              <ul className="space-y-2">
                {sources.map((s) => (
                  <li key={s.id} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 shrink-0 text-zinc-300">—</span>
                    <span className="text-zinc-600 leading-relaxed">
                      {s.finding}
                      <span className="ml-1 text-zinc-400">
                        {s.report_url ? (
                          <a
                            href={s.report_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            ({s.source_firm}{s.published_year ? `, ${s.published_year}` : ''})
                          </a>
                        ) : (
                          <>({s.source_firm}{s.published_year ? `, ${s.published_year}` : ''})</>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
