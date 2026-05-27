import { getDb } from '@/lib/db'

export async function GET() {
  const pool = getDb()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const [totalsRes, feedRes, topRes, topicsRes] = await Promise.all([
      pool.query(
        `SELECT
           (SELECT COUNT(*) FROM research_entries)::int AS total_entries,
           (SELECT COUNT(*) FROM research_entries WHERE created_at >= $1)::int AS entries_this_week,
           (SELECT COUNT(*) FROM research_entries WHERE strength_rating >= 4)::int AS high_relevance_count,
           (SELECT COUNT(*) FROM opportunities WHERE status = 'active')::int AS open_opportunities`,
        [weekAgo]
      ),
      pool.query(
        `SELECT fi.id, fi.title, fi.url, fi.created_at, fi.relevance_score, fi.added_to_db,
                fs.name AS source_name
         FROM feed_items fi
         LEFT JOIN feed_sources fs ON fs.id = fi.source_id
         ORDER BY fi.created_at DESC LIMIT 6`
      ),
      pool.query(
        `SELECT * FROM research_entries
         WHERE strength_rating >= 4
         ORDER BY strength_rating DESC, created_at DESC LIMIT 5`
      ),
      pool.query('SELECT topics FROM research_entries'),
    ])

    const topicCounts: Record<string, number> = {}
    for (const row of topicsRes.rows as { topics: string[] }[]) {
      for (const t of row.topics ?? []) {
        topicCounts[t] = (topicCounts[t] ?? 0) + 1
      }
    }

    const recentFeedItems = feedRes.rows.map((row: Record<string, unknown>) => ({
      ...row,
      feed_sources: row.source_name ? { name: row.source_name } : null,
    }))

    return Response.json({
      ...totalsRes.rows[0],
      recent_feed_items: recentFeedItems,
      top_entries: topRes.rows,
      entries_by_topic: Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count),
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
