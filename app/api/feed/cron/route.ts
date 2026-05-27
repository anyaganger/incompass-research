export const runtime = 'nodejs'

import { getDb } from '@/lib/db'
import { fetchFeed, itemMatchesKeywords } from '@/lib/rss'
import { analyzeContent } from '@/lib/gemini'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pool = getDb()
  const { rows: sources } = await pool.query(
    'SELECT * FROM feed_sources WHERE active = true'
  ) as { rows: { id: string; name: string; url: string; keywords: string[] }[] }

  if (!sources.length) {
    return Response.json({ ok: true, message: 'No active sources' })
  }

  let totalIngested = 0
  let totalAdded = 0

  for (const source of sources) {
    const items = await fetchFeed(source.url)
    if (!items.length) continue

    for (const item of items) {
      if (!item.url) continue

      const { rows: existing } = await pool.query(
        'SELECT id FROM feed_items WHERE url = $1',
        [item.url]
      )
      if (existing.length) continue
      if (!itemMatchesKeywords(item, source.keywords ?? [])) continue

      totalIngested++

      const analysis = await analyzeContent(item.title, item.content)

      if (!analysis || !analysis.relevant || !analysis.findings?.length) {
        await pool.query(
          `INSERT INTO feed_items
             (source_id, title, url, published_at, raw_content, ai_analysis, relevance_score, added_to_db)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            source.id, item.title, item.url, item.published_at.toISOString(),
            item.content.slice(0, 2000), JSON.stringify(analysis ?? null), 0, false,
          ]
        )
        continue
      }

      const topFinding = analysis.findings.sort((a, b) => b.strength_rating - a.strength_rating)[0]
      const relevanceScore = topFinding?.strength_rating ?? 0
      const willAdd = relevanceScore >= 3

      const { rows: feedRows } = await pool.query(
        `INSERT INTO feed_items
           (source_id, title, url, published_at, raw_content, ai_analysis, relevance_score, added_to_db)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [
          source.id, item.title, item.url, item.published_at.toISOString(),
          item.content.slice(0, 2000), JSON.stringify(analysis), relevanceScore, willAdd,
        ]
      )
      const feedItemId = (feedRows[0] as { id: string }).id

      if (willAdd) {
        for (const finding of analysis.findings.filter((f) => f.strength_rating >= 3)) {
          await pool.query(
            `INSERT INTO research_entries
               (finding, context, source_firm, report_name, report_url, published_year,
                topics, audience_fit, incompass_relevance, opportunity_type,
                strength_rating, incompass_angle, ai_generated, feed_item_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
            [
              finding.finding, finding.context ?? null,
              analysis.source_firm || source.name,
              analysis.report_name || item.title,
              item.url, new Date(item.published_at).getFullYear(),
              finding.topics ?? [], finding.audience_fit ?? [],
              finding.incompass_relevance ?? null, finding.opportunity_type ?? null,
              finding.strength_rating, finding.incompass_angle ?? null,
              true, feedItemId,
            ]
          )
          totalAdded++
        }
      }
    }

    await pool.query('UPDATE feed_sources SET last_fetched = NOW() WHERE id = $1', [source.id])
  }

  return Response.json({ ok: true, ingested: totalIngested, added: totalAdded })
}
