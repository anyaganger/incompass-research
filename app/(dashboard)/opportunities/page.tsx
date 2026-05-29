'use client'
import { useEffect, useState } from 'react'
import type { Opportunity } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TYPE_STYLES: Record<string, string> = {
  white_space: 'bg-purple-100 text-purple-700 border-purple-200',
  narrative_gap: 'bg-blue-100 text-blue-700 border-blue-200',
  competitor_blind_spot: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  addressed: 'bg-zinc-100 text-zinc-500',
  monitoring: 'bg-yellow-100 text-yellow-700',
}

const OPP_TYPES = [
  { value: 'white_space', label: 'White Space' },
  { value: 'narrative_gap', label: 'Narrative Gap' },
  { value: 'competitor_blind_spot', label: 'Competitor Blind Spot' },
]

const emptyForm = (): Partial<Opportunity> => ({
  title: '', description: '', opportunity_type: null, status: 'active', supporting_entry_ids: [],
})

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([])
  const [trendingTypes, setTrendingTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOpp, setEditOpp] = useState<Opportunity | null>(null)
  const [form, setForm] = useState<Partial<Opportunity>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [detailOpp, setDetailOpp] = useState<Opportunity | null>(null)

  async function loadOpps() {
    setLoading(true)
    const res = await fetch('/api/opportunities')
    const { data, trending_types } = await res.json()
    setOpps(data ?? [])
    setTrendingTypes(trending_types ?? [])
    setLoading(false)
  }

  useEffect(() => { loadOpps() }, [])

  function openAdd() {
    setEditOpp(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(o: Opportunity, e: React.MouseEvent) {
    e.stopPropagation()
    setEditOpp(o)
    setForm({ ...o })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.title) return
    setSaving(true)
    const method = editOpp ? 'PUT' : 'POST'
    const url = editOpp ? `/api/opportunities/${editOpp.id}` : '/api/opportunities'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setDialogOpen(false)
    setSaving(false)
    loadOpps()
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this opportunity?')) return
    await fetch(`/api/opportunities/${id}`, { method: 'DELETE' })
    setDetailOpp(null)
    loadOpps()
  }

  async function updateStatus(id: string, status: string, opp: Opportunity) {
    await fetch(`/api/opportunities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...opp, status }),
    })
    loadOpps()
    if (detailOpp?.id === id) setDetailOpp({ ...detailOpp, status: status as Opportunity['status'] })
  }

  const grouped: Record<string, Opportunity[]> = {
    white_space: opps.filter((o) => o.opportunity_type === 'white_space'),
    narrative_gap: opps.filter((o) => o.opportunity_type === 'narrative_gap'),
    competitor_blind_spot: opps.filter((o) => o.opportunity_type === 'competitor_blind_spot'),
    uncategorized: opps.filter((o) => !o.opportunity_type),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Opportunities</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {opps.filter((o) => o.status === 'active').length} active · {opps.length} total
            {trendingTypes.length > 0 && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {trendingTypes.length} type{trendingTypes.length > 1 ? 's' : ''} trending
              </span>
            )}
          </p>
        </div>
        <Button onClick={openAdd} className="bg-zinc-900 text-white hover:bg-zinc-700">
          + New Opportunity
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-400">Loading…</div>
      ) : opps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
          <p className="text-sm text-zinc-500">No opportunities yet.</p>
          <p className="mt-1 text-xs text-zinc-400">Create your first opportunity or run the feed to auto-generate.</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 text-sm">New Opportunity</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, list]) => {
            if (!list.length) return null
            const typeInfo = OPP_TYPES.find((t) => t.value === type)
            const isTrending = trendingTypes.includes(type)
            return (
              <div key={type}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {typeInfo?.label ?? 'Uncategorized'} ({list.length})
                  </h2>
                  {isTrending && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 animate-pulse">
                      ↑ Trending Now
                    </span>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => setDetailOpp(o)}
                      className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-800 leading-tight">{o.title}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                      {o.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{o.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        {o.opportunity_type && (
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[o.opportunity_type] ?? 'bg-zinc-100 text-zinc-600'}`}>
                            {typeInfo?.label ?? o.opportunity_type}
                          </span>
                        )}
                        {o.supporting_entry_ids?.length > 0 && (
                          <span className="ml-auto text-xs text-zinc-400">
                            {o.supporting_entry_ids.length} supporting
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editOpp ? 'Edit Opportunity' : 'New Opportunity'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Title *</label>
              <Input value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. PE portcos lack structured onboarding assessment" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Description / Memo</label>
              <Textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What does the data show? What's the opportunity for Incompass?" rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Type</label>
                <Select value={form.opportunity_type ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, opportunity_type: v as Opportunity['opportunity_type'] }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {OPP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Status</label>
                <Select value={form.status ?? 'active'} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Opportunity['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="addressed">Addressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title} className="bg-zinc-900 text-white hover:bg-zinc-700">
                {saving ? 'Saving…' : editOpp ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail panel */}
      <Dialog open={!!detailOpp} onOpenChange={() => setDetailOpp(null)}>
        <DialogContent className="max-w-lg">
          {detailOpp && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{detailOpp.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <div className="flex flex-wrap gap-2">
                  {detailOpp.opportunity_type && (
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[detailOpp.opportunity_type] ?? ''}`}>
                      {OPP_TYPES.find((t) => t.value === detailOpp.opportunity_type)?.label ?? detailOpp.opportunity_type}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[detailOpp.status]}`}>
                    {detailOpp.status}
                  </span>
                  {trendingTypes.includes(detailOpp.opportunity_type ?? '') && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      ↑ Trending Now
                    </span>
                  )}
                </div>
                {detailOpp.description && (
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{detailOpp.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Change status:</span>
                  {['active', 'monitoring', 'addressed'].map((s) => (
                    <button key={s} onClick={() => updateStatus(detailOpp.id, s, detailOpp)}
                      className={`rounded px-2 py-1 text-xs ${detailOpp.status === s ? 'bg-zinc-200 font-medium' : 'hover:bg-zinc-100'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-100">
                  <Button variant="outline" className="text-xs" onClick={(e) => openEdit(detailOpp, e)}>Edit</Button>
                  <Button variant="outline" className="text-xs text-red-500 hover:text-red-700" onClick={(e) => handleDelete(detailOpp.id, e)}>Delete</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
