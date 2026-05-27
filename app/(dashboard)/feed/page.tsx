'use client'
import { useEffect, useState } from 'react'
import type { FeedItem, FeedSource } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function FeedPage() {
  const [items, setItems] = useState<(FeedItem & { source_name?: string })[]>([])
  const [sources, setSources] = useState<FeedSource[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addSourceOpen, setAddSourceOpen] = useState(false)
  const [newSource, setNewSource] = useState({ name: '', url: '', keywords: '' })
  const [savingSource, setSavingSource] = useState(false)

  async function loadData() {
    setLoading(true)
    const [feedRes, sourcesRes] = await Promise.all([
      fetch('/api/feed?limit=100').then((r) => r.json()),
      fetch('/api/sources').then((r) => r.json()),
    ])
    setItems(feedRes.data ?? [])
    setSources(sourcesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function runFeed() {
    setRunning(true)
    setRunResult(null)
    const res = await fetch('/api/feed/cron')
    const data = await res.json()
    setRunResult(`Done — ${data.ingested ?? 0} items scanned, ${data.added ?? 0} added to database.`)
    setRunning(false)
    loadData()
  }

  async function toggleSource(id: string, active: boolean) {
    await fetch(`/api/sources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    loadData()
  }

  async function deleteSource(id: string) {
    await fetch(`/api/sources/${id}`, { method: 'DELETE' })
    loadData()
  }

  async function addSource() {
    if (!newSource.name || !newSource.url) return
    setSavingSource(true)
    await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newSource.name,
        url: newSource.url,
        keywords: newSource.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      }),
    })
    setNewSource({ name: '', url: '', keywords: '' })
    setAddSourceOpen(false)
    setSavingSource(false)
    loadData()
  }

  const addedCount = items.filter((i) => i.added_to_db).length
  const weekItems = items.filter(
    (i) => new Date(i.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Feed</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {weekItems} items this week · {addedCount} auto-added to database
          </p>
        </div>
        <div className="flex items-center gap-2">
          {runResult && <p className="text-xs text-zinc-500">{runResult}</p>}
          <Button
            onClick={runFeed}
            disabled={running}
            className="bg-zinc-900 text-white hover:bg-zinc-700"
          >
            {running ? 'Running…' : 'Run Feed Now'}
          </Button>
        </div>
      </div>

      {/* Feed Items */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Recent Ingested Items</h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">Loading…</div>
          ) : items.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              No items yet — click &ldquo;Run Feed Now&rdquo; to start.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {items.map((item) => (
                <div key={item.id} className="p-4">
                  <div
                    className="flex cursor-pointer items-start justify-between gap-4"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                            {item.title ?? 'Untitled'}
                          </a>
                        ) : (item.title ?? 'Untitled')}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {(item as { source_name?: string }).source_name ?? 'Unknown'} ·{' '}
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.relevance_score != null && item.relevance_score > 0 && (
                        <span className="text-xs text-zinc-500">
                          {'★'.repeat(item.relevance_score)}{'☆'.repeat(5 - item.relevance_score)}
                        </span>
                      )}
                      {item.added_to_db ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Added</Badge>
                      ) : (
                        <Badge variant="outline" className="text-zinc-400">Skipped</Badge>
                      )}
                      <span className="text-xs text-zinc-400">{expandedId === item.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expandedId === item.id && item.ai_analysis && (
                    <div className="mt-3 rounded-md bg-zinc-50 p-3 text-xs space-y-2">
                      {(item.ai_analysis as { findings?: { finding: string; incompass_angle: string; strength_rating: number }[] }).findings?.map((f, i) => (
                        <div key={i} className="border-b border-zinc-200 pb-2 last:border-0 last:pb-0">
                          <p className="font-medium text-zinc-800">&ldquo;{f.finding}&rdquo;</p>
                          <p className="mt-1 text-zinc-600"><span className="font-medium text-zinc-700">Incompass angle:</span> {f.incompass_angle}</p>
                          <p className="mt-0.5 text-zinc-400">Strength: {'★'.repeat(f.strength_rating)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feed Sources */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Feed Sources</h2>
          <Button variant="outline" className="text-xs" onClick={() => setAddSourceOpen(true)}>
            + Add Source
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Source</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">URL</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Last Fetched</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sources.map((s) => (
                <tr key={s.id} className="group">
                  <td className="px-4 py-3 font-medium text-zinc-800">{s.name}</td>
                  <td className="px-4 py-3">
                    <a href={s.url} target="_blank" rel="noreferrer" className="truncate text-xs text-zinc-400 hover:text-zinc-700 max-w-xs block">{s.url}</a>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {s.last_fetched ? new Date(s.last_fetched).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSource(s.id, !s.active)} className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                      {s.active ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteSource(s.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Source Dialog */}
      <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Feed Source</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Name</label>
              <Input value={newSource.name} onChange={(e) => setNewSource((s) => ({ ...s, name: e.target.value }))} placeholder="Gallup Workplace" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">RSS Feed URL</label>
              <Input type="url" value={newSource.url} onChange={(e) => setNewSource((s) => ({ ...s, url: e.target.value }))} placeholder="https://…/rss.xml" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Keywords (comma-separated)</label>
              <Input value={newSource.keywords} onChange={(e) => setNewSource((s) => ({ ...s, keywords: e.target.value }))} placeholder="talent, leadership, workforce" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddSourceOpen(false)}>Cancel</Button>
              <Button onClick={addSource} disabled={savingSource || !newSource.name || !newSource.url} className="bg-zinc-900 text-white hover:bg-zinc-700">
                {savingSource ? 'Adding…' : 'Add Source'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
