'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ResearchEntry, FeedItem } from '@/lib/types'
import { TOPICS } from '@/lib/types'

interface Stats {
  total_entries: number
  entries_this_week: number
  high_relevance_count: number
  open_opportunities: number
  recent_feed_items: (FeedItem & { feed_sources?: { name: string } })[]
  top_entries: ResearchEntry[]
  entries_by_topic: { topic: string; count: number }[]
}

const TOPIC_COLORS: Record<string, string> = {
  leadership_effectiveness: '#6366f1',
  talent_cost: '#f59e0b',
  measurement: '#10b981',
  bias: '#ef4444',
  engagement: '#3b82f6',
  pe_specific: '#8b5cf6',
  workforce_performance: '#14b8a6',
}

const RELEVANCE_COLORS: Record<string, string> = {
  direct: 'bg-green-100 text-green-700',
  adjacent: 'bg-blue-100 text-blue-700',
  gap: 'bg-orange-100 text-orange-700',
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-zinc-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
    </div>
  )
}

function topicLabel(v: string) {
  return TOPICS.find((t) => t.value === v)?.label ?? v
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        Loading…
      </div>
    )
  }

  if (!stats) return null

  const chartData = stats.entries_by_topic.map((d) => ({
    name: topicLabel(d.topic)
      .split(' ')
      .map((w) => w.slice(0, 6))
      .join(' '),
    fullName: topicLabel(d.topic),
    count: d.count,
    topic: d.topic,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Research intelligence overview for Incompass GTM
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Entries" value={stats.total_entries} />
        <StatCard label="Added This Week" value={stats.entries_this_week} />
        <StatCard
          label="High Signal"
          value={stats.high_relevance_count}
          sub="Strength ≥ 4"
        />
        <StatCard label="Open Opportunities" value={stats.open_opportunities} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Topic breakdown */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">Entries by Topic</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={28}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: '#f4f4f5' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded border border-zinc-200 bg-white px-3 py-2 text-xs shadow">
                        <p className="font-medium text-zinc-800">{d.fullName}</p>
                        <p className="text-zinc-500">{d.count} entries</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.topic}
                      fill={TOPIC_COLORS[entry.topic] ?? '#a1a1aa'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              No data yet
            </div>
          )}
        </div>

        {/* Top entries */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">
            Highest-Rated Findings
          </h2>
          {stats.top_entries.length > 0 ? (
            <div className="space-y-3">
              {stats.top_entries.map((e) => (
                <div key={e.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-sm text-zinc-800">{e.finding}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{e.source_firm}</span>
                    {e.incompass_relevance && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${RELEVANCE_COLORS[e.incompass_relevance] ?? 'bg-zinc-100 text-zinc-600'}`}
                      >
                        {e.incompass_relevance}
                      </span>
                    )}
                    <span className="ml-auto text-xs font-medium text-zinc-700">
                      {'★'.repeat(e.strength_rating)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              No entries yet
            </div>
          )}
        </div>
      </div>

      {/* Recent feed activity */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Recent Feed Activity</h2>
        {stats.recent_feed_items.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {stats.recent_feed_items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {item.title ?? 'Untitled'}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {item.feed_sources?.name ?? 'Unknown source'} ·{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.relevance_score != null && item.relevance_score > 0 && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {item.relevance_score}/5
                    </span>
                  )}
                  {item.added_to_db && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Added
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center text-sm text-zinc-400">
            No feed items yet — run the feed to get started
          </div>
        )}
      </div>
    </div>
  )
}
