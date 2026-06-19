'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
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
  trending_topics: { topic: string; recent_count: number; velocity: number }[]
}

interface TrendData {
  weekly_topic_counts: Record<string, number | string>[]
  competitor_counts: { competitor: string; count: number }[]
  velocity: { topic: string; recent_count: number; prev_count: number; velocity: number }[]
  strength_distribution: { strength_rating: number; count: number }[]
  top_weighted: (ResearchEntry & { weighted_score: number })[]
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

function topicLabel(v: string) {
  return TOPICS.find((t) => t.value === v)?.label ?? v
}

function topicShort(v: string) {
  return topicLabel(v).split(' ').map((w) => w.slice(0, 5)).join(' ')
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

function VelocityBadge({ velocity }: { velocity: number }) {
  if (velocity >= 2) return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">↑ {velocity}x</span>
  if (velocity >= 1.5) return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">↑ {velocity}x</span>
  if (velocity < 0.8 && velocity > 0) return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">↓ {velocity}x</span>
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [trends, setTrends] = useState<TrendData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then((r) => r.json()),
      fetch('/api/analytics/trends').then((r) => r.json()),
    ]).then(([s, t]) => {
      setStats(s)
      setTrends(t)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-400">Loading…</div>
  }
  if (!stats) return null

  const topicChartData = stats.entries_by_topic.map((d) => ({
    name: topicShort(d.topic),
    fullName: topicLabel(d.topic),
    count: d.count,
    topic: d.topic,
  }))

  const activeTopics = TOPICS.filter((t) =>
    trends?.weekly_topic_counts?.some((w) => Number(w[t.value] ?? 0) > 0)
  )

  const strengthFull = [1, 2, 3, 4, 5].map((n) => ({
    stars: '★'.repeat(n),
    count: trends?.strength_distribution?.find((s) => s.strength_rating === n)?.count ?? 0,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">PE talent intelligence — tracking the data that moves portco valuations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Entries" value={stats.total_entries} />
        <StatCard label="Added This Week" value={stats.entries_this_week} />
        <StatCard label="High Signal" value={stats.high_relevance_count} sub="Strength ≥ 4" />
        <StatCard label="Open Opportunities" value={stats.open_opportunities} />
      </div>

      {/* Trending Topics banner */}
      {stats.trending_topics.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Trending Now — last 30 days</p>
          <div className="flex flex-wrap gap-3">
            {stats.trending_topics.map((t) => (
              <div key={t.topic} className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: TOPIC_COLORS[t.topic] ?? '#a1a1aa' }}
                />
                <span className="text-xs font-medium text-zinc-700">{topicLabel(t.topic)}</span>
                <VelocityBadge velocity={t.velocity} />
                <span className="text-xs text-zinc-400">{t.recent_count} entries</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic velocity + Weighted top findings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-zinc-700">Topic Velocity</h2>
          <p className="mb-4 text-xs text-zinc-400">New entries per topic, last 8 weeks</p>
          {trends?.weekly_topic_counts && trends.weekly_topic_counts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends.weekly_topic_counts}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded border border-zinc-200 bg-white px-3 py-2 text-xs shadow">
                        <p className="mb-1 font-medium text-zinc-700">Week of {label}</p>
                        {payload.map((p) => (
                          <p key={p.dataKey as string} style={{ color: p.color }} className="text-xs">
                            {topicLabel(p.dataKey as string)}: {p.value}
                          </p>
                        ))}
                      </div>
                    )
                  }}
                />
                {activeTopics.map((t) => (
                  <Line
                    key={t.value}
                    type="monotone"
                    dataKey={t.value}
                    stroke={TOPIC_COLORS[t.value] ?? '#a1a1aa'}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              Run the feed to see trends build up
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-zinc-700">Top-Weighted Findings</h2>
          <p className="mb-4 text-xs text-zinc-400">Strength + recency + team votes + relevance</p>
          {trends?.top_weighted && trends.top_weighted.length > 0 ? (
            <div className="space-y-3">
              {trends.top_weighted.map((e) => (
                <div key={e.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-sm text-zinc-800">{e.finding}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{e.source_firm}</span>
                    {e.incompass_relevance && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RELEVANCE_COLORS[e.incompass_relevance] ?? ''}`}>
                        {e.incompass_relevance}
                      </span>
                    )}
                    <span className="ml-auto rounded bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white">
                      {e.weighted_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">No entries yet</div>
          )}
        </div>
      </div>

      {/* Competitor landscape + Strength distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-zinc-700">Competitor Landscape</h2>
          <p className="mb-4 text-xs text-zinc-400">Competitors mentioned across all findings</p>
          {trends?.competitor_counts && trends.competitor_counts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends.competitor_counts} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="competitor" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  cursor={{ fill: '#f4f4f5' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded border border-zinc-200 bg-white px-3 py-2 text-xs shadow">
                        <p className="font-medium">{payload[0].payload.competitor}</p>
                        <p className="text-zinc-500">{payload[0].value} mentions</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-center text-sm text-zinc-400">
              Competitors auto-detected as findings are added
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-zinc-700">Signal Quality Distribution</h2>
          <p className="mb-4 text-xs text-zinc-400">Entries by strength rating</p>
          {strengthFull.some((s) => s.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={strengthFull} barSize={32}>
                <XAxis dataKey="stars" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f4f4f5' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded border border-zinc-200 bg-white px-3 py-2 text-xs shadow">
                        <p className="font-medium">{payload[0].payload.stars}</p>
                        <p className="text-zinc-500">{payload[0].value} entries</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {strengthFull.map((_, i) => (
                    <Cell key={i} fill={['#d1d5db','#9ca3af','#6366f1','#8b5cf6','#10b981'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">No data yet</div>
          )}
        </div>
      </div>

      {/* Topic distribution (existing) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">Entries by Topic</h2>
          {topicChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topicChartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={28} />
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
                  {topicChartData.map((entry) => (
                    <Cell key={entry.topic} fill={TOPIC_COLORS[entry.topic] ?? '#a1a1aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">No data yet</div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">Highest-Rated Findings</h2>
          {stats.top_entries.length > 0 ? (
            <div className="space-y-3">
              {stats.top_entries.map((e) => (
                <div key={e.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-sm text-zinc-800">{e.finding}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{e.source_firm}</span>
                    {e.incompass_relevance && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RELEVANCE_COLORS[e.incompass_relevance] ?? ''}`}>
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
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">No entries yet</div>
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
                  <p className="truncate text-sm font-medium text-zinc-800">{item.title ?? 'Untitled'}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {item.feed_sources?.name ?? 'Unknown source'} ·{' '}
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.relevance_score != null && item.relevance_score > 0 && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {item.relevance_score}/5
                    </span>
                  )}
                  {item.added_to_db && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Added</span>
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
