export const runtime = 'nodejs'
import { getDb } from '@/lib/db'

export async function GET() {
  const pool = getDb()
  try {
    const [weeklyRes, competitorRes, velocityRes, strengthRes, topWeightedRes] = await Promise.all([
      pool.query(`
        SELECT
          to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS week,
          unnest(topics) AS topic,
          COUNT(*)::int AS count
        FROM research_entries
        WHERE created_at >= NOW() - INTERVAL '8 weeks'
          AND array_length(topics, 1) > 0
        GROUP BY 1, 2
        ORDER BY 1, 2
      `),
      pool.query(`
        SELECT unnest(competitors_mentioned) AS competitor, COUNT(*)::int AS count
        FROM research_entries
        WHERE array_length(competitors_mentioned, 1) > 0
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 8
      `),
      pool.query(`
        WITH recent AS (
          SELECT unnest(topics) AS topic, COUNT(*)::int AS count
          FROM research_entries
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY 1
        ),
        prev AS (
          SELECT unnest(topics) AS topic, COUNT(*)::int AS count
          FROM research_entries
          WHERE created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
          GROUP BY 1
        )
        SELECT
          r.topic,
          r.count AS recent_count,
          COALESCE(p.count, 0) AS prev_count,
          ROUND(CASE WHEN COALESCE(p.count, 0) = 0
                     THEN r.count::numeric
                     ELSE r.count::numeric / p.count::numeric
                END, 2)::float AS velocity
        FROM recent r
        LEFT JOIN prev p ON p.topic = r.topic
        ORDER BY velocity DESC, recent_count DESC
      `),
      pool.query(`
        SELECT strength_rating, COUNT(*)::int AS count
        FROM research_entries
        GROUP BY 1
        ORDER BY 1
      `),
      pool.query(`
        SELECT id, finding, source_firm, strength_rating,
          COALESCE(votes_up, 0)   AS votes_up,
          COALESCE(votes_down, 0) AS votes_down,
          incompass_relevance, published_year,
          ROUND((
            strength_rating
            + GREATEST(COALESCE(votes_up,0) - COALESCE(votes_down,0), 0)::numeric * 0.5
            + CASE WHEN published_year >= 2024 THEN 1.0 ELSE 0.0 END
            + CASE WHEN incompass_relevance = 'direct'   THEN 1.0
                   WHEN incompass_relevance = 'adjacent' THEN 0.5
                   ELSE 0.0 END
          )::numeric, 1) AS weighted_score
        FROM research_entries
        ORDER BY weighted_score DESC, created_at DESC
        LIMIT 8
      `),
    ])

    // Pivot weekly rows → { week, topic1: count, topic2: count, ... }
    const weekMap: Record<string, Record<string, number | string>> = {}
    for (const row of weeklyRes.rows as { week: string; topic: string; count: number }[]) {
      if (!weekMap[row.week]) weekMap[row.week] = { week: row.week }
      weekMap[row.week][row.topic] = row.count
    }
    const weeklyData = Object.values(weekMap).sort((a, b) =>
      (a.week as string).localeCompare(b.week as string)
    )

    return Response.json({
      weekly_topic_counts: weeklyData,
      competitor_counts: competitorRes.rows,
      velocity: velocityRes.rows,
      strength_distribution: strengthRes.rows,
      top_weighted: topWeightedRes.rows,
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
