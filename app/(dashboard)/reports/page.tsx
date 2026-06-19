'use client'
import { useEffect, useState, useMemo } from 'react'
import type { ResearchEntry } from '@/lib/types'
import { TOPICS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function csvEscape(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

const TOPIC_LABEL: Record<string, string> = Object.fromEntries(
  TOPICS.map((t) => [t.value, t.label])
)

export default function ReportsPage() {
  const [entries, setEntries] = useState<ResearchEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterAudience, setFilterAudience] = useState('all')

  useEffect(() => {
    fetch('/api/entries?limit=500&sort=weighted')
      .then((r) => r.json())
      .then(({ data, error }) => {
        if (error) setError(error)
        setEntries(data ?? [])
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return entries.filter((e) => {
      if (q && !e.finding.toLowerCase().includes(q) && !e.source_firm.toLowerCase().includes(q) && !(e.report_name ?? '').toLowerCase().includes(q)) return false
      if (filterTopic !== 'all' && !(e.topics ?? []).includes(filterTopic)) return false
      if (filterAudience !== 'all' && !(e.audience_fit ?? []).includes(filterAudience)) return false
      return true
    })
  }, [entries, search, filterTopic, filterAudience])

  function downloadCSV() {
    const headers = ['Finding', 'Context', 'Source', 'Report', 'URL', 'Year', 'Topics', 'Strength', 'PE Angle']
    const rows = filtered.map((e) =>
      [
        e.finding,
        e.context ?? '',
        e.source_firm,
        e.report_name ?? '',
        e.report_url ?? '',
        String(e.published_year ?? ''),
        (e.topics ?? []).map((t) => TOPIC_LABEL[t] ?? t).join('; '),
        String(e.strength_rating),
        e.incompass_angle ?? '',
      ]
        .map(csvEscape)
        .join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `incompass-findings-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Reports</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {loading ? 'Loading…' : `${filtered.length} finding${filtered.length !== 1 ? 's' : ''} from primary sources`}
          </p>
        </div>
        <Button
          onClick={downloadCSV}
          disabled={loading || !filtered.length}
          variant="outline"
          className="shrink-0"
        >
          Export CSV ({filtered.length})
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search findings, sources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={filterTopic} onValueChange={(v) => setFilterTopic(v ?? 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {TOPICS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAudience} onValueChange={(v) => setFilterAudience(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All audiences" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All audiences</SelectItem>
            <SelectItem value="pe_firms">PE Firms</SelectItem>
            <SelectItem value="c_suite">C-Suite</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
        {(search || filterTopic !== 'all' || filterAudience !== 'all') && (
          <button
            onClick={() => { setSearch(''); setFilterTopic('all'); setFilterAudience('all') }}
            className="text-xs text-zinc-400 hover:text-zinc-700 self-center"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Findings list */}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
          Loading findings…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
          No findings match your filters.
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
          {filtered.map((e) => (
            <div key={e.id} className="px-5 py-4">
              {/* Finding */}
              <p className="text-sm leading-relaxed text-zinc-800">
                &ldquo;{e.finding}&rdquo;
              </p>

              {/* Source row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                {e.report_url ? (
                  <a
                    href={e.report_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {e.source_firm}{e.published_year ? ` ${e.published_year}` : ''}
                  </a>
                ) : (
                  <span className="text-xs font-medium text-zinc-500">
                    {e.source_firm}{e.published_year ? ` ${e.published_year}` : ''}
                  </span>
                )}

                {e.report_name && (
                  <span className="text-xs text-zinc-400 truncate max-w-xs" title={e.report_name}>
                    · {e.report_name}
                  </span>
                )}

                <span className="ml-auto text-xs text-zinc-300 tabular-nums">
                  {'★'.repeat(e.strength_rating)}{'☆'.repeat(5 - e.strength_rating)}
                </span>
              </div>

              {/* PE angle — only when present */}
              {e.incompass_angle && (
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed border-l-2 border-zinc-200 pl-3">
                  {e.incompass_angle}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
