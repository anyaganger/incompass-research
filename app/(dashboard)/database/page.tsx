'use client'
import { useEffect, useState, useCallback } from 'react'
import type { ResearchEntry } from '@/lib/types'
import { TOPICS, AUDIENCE_FIT, INCOMPASS_RELEVANCE, OPPORTUNITY_TYPES } from '@/lib/types'
import { COMPETITORS } from '@/lib/scoring'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const RELEVANCE_COLORS: Record<string, string> = {
  direct: 'bg-green-100 text-green-700 border-green-200',
  adjacent: 'bg-blue-100 text-blue-700 border-blue-200',
  gap: 'bg-orange-100 text-orange-700 border-orange-200',
}
const OPP_COLORS: Record<string, string> = {
  white_space: 'bg-purple-100 text-purple-700 border-purple-200',
  validates_product: 'bg-green-100 text-green-700 border-green-200',
  new_use_case: 'bg-blue-100 text-blue-700 border-blue-200',
  new_buyer: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  competitor_gap: 'bg-red-100 text-red-700 border-red-200',
}

const CURRENT_YEAR = new Date().getFullYear()

function isStale(entry: ResearchEntry): boolean {
  if (entry.published_year) return entry.published_year <= CURRENT_YEAR - 2
  const created = new Date(entry.created_at).getTime()
  return Date.now() - created > 18 * 30 * 24 * 60 * 60 * 1000
}

const emptyForm = (): Partial<ResearchEntry> => ({
  finding: '', context: '', source_firm: '', report_name: '', report_url: '',
  published_year: undefined, topics: [], audience_fit: [], incompass_relevance: null,
  opportunity_type: null, strength_rating: 3, notes: '', incompass_angle: '',
})

export default function DatabasePage() {
  const [entries, setEntries] = useState<ResearchEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterRelevance, setFilterRelevance] = useState('all')
  const [filterStrength, setFilterStrength] = useState('1')
  const [filterMinYear, setFilterMinYear] = useState('')
  const [filterCompetitor, setFilterCompetitor] = useState('all')
  const [sortBy, setSortBy] = useState('weighted')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<ResearchEntry | null>(null)
  const [form, setForm] = useState<Partial<ResearchEntry>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Talking point state
  const [tpEntry, setTpEntry] = useState<ResearchEntry | null>(null)
  const [tpText, setTpText] = useState('')
  const [tpLoading, setTpLoading] = useState(false)
  const [tpCopied, setTpCopied] = useState(false)

  // Vote optimistic state: id → { up, down }
  const [voteCounts, setVoteCounts] = useState<Record<string, { votes_up: number; votes_down: number }>>({})

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      search, minStrength: filterStrength, sort: sortBy,
      ...(filterTopic !== 'all' && { topic: filterTopic }),
      ...(filterRelevance !== 'all' && { relevance: filterRelevance }),
      ...(filterMinYear && { minYear: filterMinYear }),
      ...(filterCompetitor !== 'all' && { competitor: filterCompetitor }),
    })
    const res = await fetch(`/api/entries?${params}`)
    const { data } = await res.json()
    setEntries(data ?? [])
    setLoading(false)
  }, [search, filterTopic, filterRelevance, filterStrength, filterMinYear, filterCompetitor, sortBy])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  function openAdd() {
    setEditEntry(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(e: ResearchEntry) {
    setEditEntry(e)
    setForm({ ...e })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.finding || !form.source_firm) return
    setSaving(true)
    const method = editEntry ? 'PUT' : 'POST'
    const url = editEntry ? `/api/entries/${editEntry.id}` : '/api/entries'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setDialogOpen(false)
    setSaving(false)
    fetchEntries()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/entries/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchEntries()
  }

  function toggleArrayField(field: 'topics' | 'audience_fit', value: string) {
    const current = (form[field] as string[]) ?? []
    setForm((f) => ({
      ...f,
      [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    }))
  }

  async function handleVote(entry: ResearchEntry, vote: 'up' | 'down') {
    const cur = voteCounts[entry.id] ?? {
      votes_up: entry.votes_up ?? 0,
      votes_down: entry.votes_down ?? 0,
    }
    setVoteCounts((prev) => ({
      ...prev,
      [entry.id]: {
        votes_up: vote === 'up' ? cur.votes_up + 1 : cur.votes_up,
        votes_down: vote === 'down' ? cur.votes_down + 1 : cur.votes_down,
      },
    }))
    const res = await fetch(`/api/entries/${entry.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setVoteCounts((prev) => ({ ...prev, [entry.id]: data }))
    }
  }

  async function openTalkingPoint(entry: ResearchEntry) {
    setTpEntry(entry)
    setTpText('')
    setTpCopied(false)
    setTpLoading(true)
    const res = await fetch(`/api/entries/${entry.id}/talking-point`, { method: 'POST' })
    const data = await res.json()
    setTpText(data.talking_point ?? '')
    setTpLoading(false)
  }

  async function copyTalkingPoint() {
    await navigator.clipboard.writeText(tpText)
    setTpCopied(true)
    setTimeout(() => setTpCopied(false), 2000)
  }

  const topicLabel = (v: string) => TOPICS.find((t) => t.value === v)?.label ?? v
  const audLabel = (v: string) => AUDIENCE_FIT.find((t) => t.value === v)?.label ?? v
  const oppLabel = (v: string) => OPPORTUNITY_TYPES.find((t) => t.value === v)?.label ?? v

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Research Database</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{entries.length} entries</p>
        </div>
        <Button onClick={openAdd} className="bg-zinc-900 text-white hover:bg-zinc-700">
          + Add Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search findings, sources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-56"
        />
        <Select value={filterTopic} onValueChange={(v) => setFilterTopic(v ?? 'all')}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All topics" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {TOPICS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRelevance} onValueChange={(v) => setFilterRelevance(v ?? 'all')}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All relevance" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All relevance</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="adjacent">Adjacent</SelectItem>
            <SelectItem value="gap">Gap</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStrength} onValueChange={(v) => setFilterStrength(v ?? '1')}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Min strength" /></SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}+ stars</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMinYear} onValueChange={(v) => setFilterMinYear(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="w-28"><SelectValue placeholder="All years" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {[2020,2021,2022,2023,2024,2025].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}+</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCompetitor} onValueChange={(v) => setFilterCompetitor(v ?? 'all')}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Competitor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All competitors</SelectItem>
            {COMPETITORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? 'weighted')}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weighted">Sort: Weighted</SelectItem>
            <SelectItem value="strength">Sort: Strength</SelectItem>
            <SelectItem value="recent">Sort: Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-400">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
            No entries found. Add one or run the feed.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Finding</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Topics</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Relevance</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Votes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {entries.map((e) => {
                const votes = voteCounts[e.id] ?? { votes_up: e.votes_up ?? 0, votes_down: e.votes_down ?? 0 }
                const stale = isStale(e)
                return (
                  <tr key={e.id} className="group hover:bg-zinc-50">
                    <td className="max-w-xs px-4 py-3">
                      <p className="line-clamp-2 text-zinc-800">{e.finding}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {e.ai_generated && <span className="text-xs text-zinc-400">AI</span>}
                        {e.competitors_mentioned && e.competitors_mentioned.length > 0 && (
                          <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-xs text-red-500">
                            mentions {e.competitors_mentioned.slice(0,2).join(', ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                      {e.source_firm}
                      {e.published_year && (
                        <span className={`ml-1 ${stale ? 'text-amber-500' : 'text-zinc-400'}`} title={stale ? 'Data may be outdated' : ''}>
                          {e.published_year}{stale ? ' ⚠' : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {e.topics?.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {topicLabel(t).split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {e.incompass_relevance && (
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${RELEVANCE_COLORS[e.incompass_relevance]}`}>
                          {e.incompass_relevance}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-zinc-700">{'★'.repeat(e.strength_rating)}{'☆'.repeat(5 - e.strength_rating)}</span>
                        {e.weighted_score != null && (
                          <span className="text-xs font-semibold text-zinc-900">{e.weighted_score} <span className="font-normal text-zinc-400">wt</span></span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVote(e, 'up')}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-green-50 hover:text-green-600"
                        >
                          👍 {votes.votes_up}
                        </button>
                        <button
                          onClick={() => handleVote(e, 'down')}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-red-50 hover:text-red-500"
                        >
                          👎 {votes.votes_down}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openTalkingPoint(e)}
                          className="rounded bg-zinc-900 px-2 py-1 text-xs text-white hover:bg-zinc-700"
                        >
                          Use This
                        </button>
                        <button onClick={() => openEdit(e)} className="text-xs text-zinc-500 hover:text-zinc-900">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(e.id)} className="text-xs text-red-400 hover:text-red-600">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Talking Point Modal */}
      <Dialog open={!!tpEntry} onOpenChange={(open) => { if (!open) setTpEntry(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Talking Point</DialogTitle>
          </DialogHeader>
          {tpEntry && (
            <div className="space-y-4 pt-1">
              <p className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500 line-clamp-2">{tpEntry.finding}</p>
              {tpLoading ? (
                <div className="flex h-20 items-center justify-center text-sm text-zinc-400">Generating…</div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-zinc-800">{tpText}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setTpEntry(null)}>Close</Button>
                    <Button
                      onClick={copyTalkingPoint}
                      className="bg-zinc-900 text-white hover:bg-zinc-700"
                    >
                      {tpCopied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editEntry ? 'Edit Entry' : 'Add Research Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Finding *</label>
              <Textarea value={form.finding ?? ''} onChange={(e) => setForm((f) => ({ ...f, finding: e.target.value }))} placeholder="Verbatim statistic or finding…" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Context</label>
              <Textarea value={form.context ?? ''} onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))} placeholder="1-2 sentences of surrounding context…" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Source Firm *</label>
                <Input value={form.source_firm ?? ''} onChange={(e) => setForm((f) => ({ ...f, source_firm: e.target.value }))} placeholder="McKinsey, Gallup…" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Year</label>
                <Input type="number" value={form.published_year ?? ''} onChange={(e) => setForm((f) => ({ ...f, published_year: parseInt(e.target.value) || undefined }))} placeholder="2024" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Report Name</label>
              <Input value={form.report_name ?? ''} onChange={(e) => setForm((f) => ({ ...f, report_name: e.target.value }))} placeholder="State of the Workforce 2024…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Report URL</label>
              <Input type="url" value={form.report_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, report_url: e.target.value }))} placeholder="https://…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-2">Topics</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TOPICS.map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(form.topics ?? []).includes(t.value)} onChange={() => toggleArrayField('topics', t.value)} className="rounded border-zinc-300" />
                    <span className="text-xs text-zinc-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-2">Audience Fit</label>
              <div className="grid grid-cols-2 gap-1.5">
                {AUDIENCE_FIT.map((a) => (
                  <label key={a.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(form.audience_fit ?? []).includes(a.value)} onChange={() => toggleArrayField('audience_fit', a.value)} className="rounded border-zinc-300" />
                    <span className="text-xs text-zinc-700">{a.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Relevance</label>
                <Select value={form.incompass_relevance ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, incompass_relevance: v as ResearchEntry['incompass_relevance'] }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {INCOMPASS_RELEVANCE.map((r) => <SelectItem key={r.value} value={r.value}>{r.value.charAt(0).toUpperCase() + r.value.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Opportunity Type</label>
                <Select value={form.opportunity_type ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, opportunity_type: v as ResearchEntry['opportunity_type'] }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_TYPES.map((o) => <SelectItem key={o.value} value={o.value}>{oppLabel(o.value)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Strength (1–5)</label>
                <Select value={String(form.strength_rating ?? 3)} onValueChange={(v) => setForm((f) => ({ ...f, strength_rating: parseInt(v ?? '3') }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{'★'.repeat(n)} {n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Incompass Angle</label>
              <Textarea value={form.incompass_angle ?? ''} onChange={(e) => setForm((f) => ({ ...f, incompass_angle: e.target.value }))} placeholder="Why does this matter for Incompass's GTM? Be specific about buyer and product…" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Notes</label>
              <Textarea value={form.notes ?? ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Context, caveats, sample size…" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.finding || !form.source_firm} className="bg-zinc-900 text-white hover:bg-zinc-700">
                {saving ? 'Saving…' : editEntry ? 'Save Changes' : 'Add Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete entry?</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-600">This cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
