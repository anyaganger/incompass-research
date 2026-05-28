'use client'
import { useEffect, useState, useCallback } from 'react'
import type { ResearchEntry } from '@/lib/types'
import { TOPICS, AUDIENCE_FIT, INCOMPASS_RELEVANCE, OPPORTUNITY_TYPES } from '@/lib/types'
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<ResearchEntry | null>(null)
  const [form, setForm] = useState<Partial<ResearchEntry>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      search, minStrength: filterStrength,
      ...(filterTopic !== 'all' && { topic: filterTopic }),
      ...(filterRelevance !== 'all' && { relevance: filterRelevance }),
      ...(filterMinYear && { minYear: filterMinYear }),
    })
    const res = await fetch(`/api/entries?${params}`)
    const { data } = await res.json()
    setEntries(data ?? [])
    setLoading(false)
  }, [search, filterTopic, filterRelevance, filterStrength, filterMinYear])

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
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search findings, sources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
        <Select value={filterTopic} onValueChange={(v) => setFilterTopic(v ?? 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {TOPICS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRelevance} onValueChange={(v) => setFilterRelevance(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All relevance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All relevance</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="adjacent">Adjacent</SelectItem>
            <SelectItem value="gap">Gap</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStrength} onValueChange={(v) => setFilterStrength(v ?? '1')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Min strength" />
          </SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}+ stars</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMinYear} onValueChange={(v) => setFilterMinYear(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            <SelectItem value="2020">2020+</SelectItem>
            <SelectItem value="2021">2021+</SelectItem>
            <SelectItem value="2022">2022+</SelectItem>
            <SelectItem value="2023">2023+</SelectItem>
            <SelectItem value="2024">2024+</SelectItem>
            <SelectItem value="2025">2025+</SelectItem>
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Strength</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {entries.map((e) => (
                <tr key={e.id} className="group hover:bg-zinc-50">
                  <td className="max-w-xs px-4 py-3">
                    <p className="line-clamp-2 text-zinc-800">{e.finding}</p>
                    {e.ai_generated && (
                      <span className="mt-0.5 text-xs text-zinc-400">AI</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                    {e.source_firm}
                    {e.published_year && <span className="ml-1 text-zinc-400">{e.published_year}</span>}
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
                  <td className="px-4 py-3 text-zinc-700">
                    {'★'.repeat(e.strength_rating)}{'☆'.repeat(5 - e.strength_rating)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEdit(e)} className="text-xs text-zinc-500 hover:text-zinc-900">
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(e.id)} className="text-xs text-red-400 hover:text-red-600">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editEntry ? 'Edit Entry' : 'Add Research Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Finding *</label>
              <Textarea
                value={form.finding ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, finding: e.target.value }))}
                placeholder="Verbatim statistic or finding…"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Context</label>
              <Textarea
                value={form.context ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                placeholder="1-2 sentences of surrounding context…"
                rows={2}
              />
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
                    <input type="checkbox" checked={(form.topics ?? []).includes(t.value)}
                      onChange={() => toggleArrayField('topics', t.value)}
                      className="rounded border-zinc-300" />
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
                    <input type="checkbox" checked={(form.audience_fit ?? []).includes(a.value)}
                      onChange={() => toggleArrayField('audience_fit', a.value)}
                      className="rounded border-zinc-300" />
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
              <Textarea
                value={form.incompass_angle ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, incompass_angle: e.target.value }))}
                placeholder="Why does this matter for Incompass's GTM? Be specific about buyer and product…"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Notes</label>
              <Textarea
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Context, caveats, sample size…"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.finding || !form.source_firm}
                className="bg-zinc-900 text-white hover:bg-zinc-700"
              >
                {saving ? 'Saving…' : editEntry ? 'Save Changes' : 'Add Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete entry?</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-600">This cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
