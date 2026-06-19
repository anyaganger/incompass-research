export const runtime = 'nodejs'

import { getDb } from '@/lib/db'
import { generateContent, type ContentFormat } from '@/lib/gemini'

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 })
  }

  const { format, angle, audience, entryIds } = (await req.json()) as {
    format: ContentFormat
    angle?: string
    audience?: string
    entryIds?: string[]
  }

  if (!format || !['linkedin', 'newsletter', 'article'].includes(format)) {
    return Response.json({ error: 'Invalid format' }, { status: 400 })
  }

  const pool = getDb()

  let rows: {
    id: string
    finding: string
    source_firm: string
    published_year: number | null
    report_url: string | null
    incompass_angle: string | null
    topics: string[]
    strength_rating: number
    audience_fit: string[]
  }[]

  if (entryIds && entryIds.length > 0) {
    // User picked specific findings
    const { rows: r } = await pool.query(
      `SELECT id, finding, source_firm, published_year, report_url, incompass_angle, topics, strength_rating, audience_fit
       FROM research_entries
       WHERE id = ANY($1::uuid[])
       ORDER BY strength_rating DESC`,
      [entryIds]
    )
    rows = r
  } else {
    // Auto-select: top findings by weighted score, filtered for PE/audience
    const audienceFilter =
      audience && audience !== 'all'
        ? `AND audience_fit @> ARRAY[$1]::text[] AND strength_rating >= 3`
        : `AND strength_rating >= 3`

    const params: unknown[] =
      audience && audience !== 'all' ? [audience] : []
    const limitIdx = params.length + 1
    params.push(12)

    const { rows: r } = await pool.query(
      `SELECT id, finding, source_firm, published_year, report_url, incompass_angle, topics, strength_rating, audience_fit
       FROM research_entries
       WHERE 1=1 ${audienceFilter}
       ORDER BY (strength_rating * 2 + COALESCE(votes_up,0) - COALESCE(votes_down,0)) DESC, created_at DESC
       LIMIT $${limitIdx}`,
      params
    )
    rows = r
  }

  if (!rows.length) {
    return Response.json({ error: 'No findings in database yet. Add some entries first.' }, { status: 400 })
  }

  let draft: string
  try {
    draft = await generateContent(format, rows, angle)
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }

  return Response.json({
    draft,
    sources: rows.map((r) => ({
      id: r.id,
      finding: r.finding.slice(0, 120),
      source_firm: r.source_firm,
      published_year: r.published_year,
      report_url: r.report_url,
    })),
  })
}
