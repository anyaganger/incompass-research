'use client'
import { useEffect, useState } from 'react'
import type { ResearchEntry } from '@/lib/types'
import { TOPICS, AUDIENCE_FIT, INCOMPASS_RELEVANCE, OPPORTUNITY_TYPES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const topicLabel = (v: string) => TOPICS.find((t) => t.value === v)?.label ?? v
const audLabel = (v: string) => AUDIENCE_FIT.find((t) => t.value === v)?.label ?? v
const relLabel = (v: string) => INCOMPASS_RELEVANCE.find((t) => t.value === v)?.label.split(' ')[0] ?? v
const oppLabel = (v: string) => OPPORTUNITY_TYPES.find((t) => t.value === v)?.label ?? v

function csvEscape(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

export default function ReportsPage() {
  const [entries, setEntries] = useState<ResearchEntry[]>([])
  const [filtered, setFiltered] = useState<ResearchEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAudience, setFilterAudience] = useState('all')
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterRelevance, setFilterRelevance] = useState('all')
  const [filterStrength, setFilterStrength] = useState('3')
  const [briefing, setBriefing] = useState<string | null>(null)
  const [generatingBriefing, setGeneratingBriefing] = useState(false)

  useEffect(() => {
    fetch('/api/entries?limit=500')
      .then((r) => r.json())
      .then(({ data }) => {
        setEntries(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = entries
    if (filterAudience !== 'all') result = result.filter((e) => e.audience_fit?.includes(filterAudience))
    if (filterTopic !== 'all') result = result.filter((e) => e.topics?.includes(filterTopic))
    if (filterRelevance !== 'all') result = result.filter((e) => e.incompass_relevance === filterRelevance)
    result = result.filter((e) => e.strength_rating >= parseInt(filterStrength))
    setFiltered(result)
    setBriefing(null)
  }, [entries, filterAudience, filterTopic, filterRelevance, filterStrength])

  function downloadCSV() {
    const headers = ['Finding', 'Context', 'Source Firm', 'Report Name', 'URL', 'Year', 'Topics', 'Audience', 'Relevance', 'Opportunity Type', 'Strength', 'Incompass Angle', 'Notes']
    const rows = filtered.map((e) => [
      e.finding, e.context ?? '', e.source_firm, e.report_name ?? '',
      e.report_url ?? '', String(e.published_year ?? ''),
      (e.topics ?? []).map(topicLabel).join('; '),
      (e.audience_fit ?? []).map(audLabel).join('; '),
      e.incompass_relevance ?? '', e.opportunity_type ?? '',
      String(e.strength_rating), e.incompass_angle ?? '', e.notes ?? '',
    ].map(csvEscape).join(','))

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `incompass-research-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function generateBriefing() {
    setGeneratingBriefing(true)
    setBriefing(null)
    const payload = filtered.slice(0, 30).map((e) => ({
      finding: e.finding,
      source_firm: e.source_firm,
      incompass_angle: e.incompass_angle,
      topics: e.topics,
    }))
    const res = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: payload }),
    })
    const data = await res.json()
    setBriefing(data.briefing ?? 'Failed to generate.')
    setGeneratingBriefing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Reports</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Filter and export research for GTM use</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Filters</p>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Audience</label>
            <Select value={filterAudience} onValueChange={(v) => setFilterAudience(v ?? 'all')}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {AUDIENCE_FIT.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Topic</label>
            <Select value={filterTopic} onValueChange={(v) => setFilterTopic(v ?? 'all')}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {TOPICS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Relevance</label>
            <Select value={filterRelevance} onValueChange={(v) => setFilterRelevance(v ?? 'all')}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="adjacent">Adjacent</SelectItem>
                <SelectItem value="gap">Gap</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Min strength</label>
            <Select value={filterStrength} onValueChange={(v) => setFilterStrength(v ?? '1')}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}+ stars</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          {loading ? 'Loading…' : `${filtered.length} of ${entries.length} entries match`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={downloadCSV} disabled={!filtered.length} variant="outline">
          Export CSV ({filtered.length})
        </Button>
        <Button
          onClick={generateBriefing}
          disabled={!filtered.length || generatingBriefing}
          className="bg-zinc-900 text-white hover:bg-zinc-700"
        >
          {generatingBriefing ? 'Generating…' : 'Generate Monthly Briefing'}
        </Button>
      </div>

      {/* Briefing output */}
      {briefing && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-700">
              Monthly Briefing — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(briefing)
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700"
            >
              Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{briefing}</pre>
        </div>
      )}

      {/* Preview table */}
      {!loading && filtered.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Preview</h2>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Finding</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Source</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Incompass Angle</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">★</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.slice(0, 50).map((e) => (
                  <tr key={e.id}>
                    <td className="max-w-xs px-4 py-3">
                      <p className="line-clamp-2 text-zinc-800">{e.finding}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {e.source_firm}{e.published_year ? ` ${e.published_year}` : ''}
                    </td>
                    <td className="max-w-sm px-4 py-3">
                      <p className="line-clamp-2 text-xs text-zinc-500">{e.incompass_angle}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{'★'.repeat(e.strength_rating)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 50 && (
              <div className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-400">
                Showing 50 of {filtered.length}. Export CSV to get all.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
