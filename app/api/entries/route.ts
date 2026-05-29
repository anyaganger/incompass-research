import { getDb } from '@/lib/db'
import { detectCompetitors, WEIGHTED_SCORE_SQL } from '@/lib/scoring'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const topic = searchParams.get('topic') ?? ''
  const audience = searchParams.get('audience') ?? ''
  const relevance = searchParams.get('relevance') ?? ''
  const minStrength = parseInt(searchParams.get('minStrength') ?? '1')
  const minYear = searchParams.get('minYear') ?? ''
  const source = searchParams.get('source') ?? ''
  const competitor = searchParams.get('competitor') ?? ''
  const sort = searchParams.get('sort') ?? 'weighted'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '200'), 500)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const pool = getDb()
  const conditions: string[] = ['strength_rating >= $1']
  const params: unknown[] = [minStrength]
  let idx = 2

  if (search) {
    conditions.push(
      `(finding ILIKE $${idx} OR source_firm ILIKE $${idx} OR COALESCE(report_name,'') ILIKE $${idx})`
    )
    params.push(`%${search}%`)
    idx++
  }
  if (topic) {
    conditions.push(`topics @> ARRAY[$${idx}]::text[]`)
    params.push(topic)
    idx++
  }
  if (audience) {
    conditions.push(`audience_fit @> ARRAY[$${idx}]::text[]`)
    params.push(audience)
    idx++
  }
  if (relevance) {
    conditions.push(`incompass_relevance = $${idx}`)
    params.push(relevance)
    idx++
  }
  if (source) {
    conditions.push(`source_firm ILIKE $${idx}`)
    params.push(`%${source}%`)
    idx++
  }
  if (minYear) {
    conditions.push(`published_year >= $${idx}`)
    params.push(parseInt(minYear))
    idx++
  }
  if (competitor) {
    conditions.push(`competitors_mentioned @> ARRAY[$${idx}]::text[]`)
    params.push(competitor)
    idx++
  }

  const orderBy =
    sort === 'recent' ? 'created_at DESC' :
    sort === 'strength' ? 'strength_rating DESC, created_at DESC' :
    `${WEIGHTED_SCORE_SQL.replace(' AS weighted_score', '')} DESC, created_at DESC`

  params.push(limit, offset)

  try {
    const { rows } = await pool.query(
      `SELECT *, ${WEIGHTED_SCORE_SQL}
       FROM research_entries
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    )
    return Response.json({ data: rows })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const b = await req.json()
  const pool = getDb()

  const allText = [b.finding, b.context ?? '', b.incompass_angle ?? ''].join(' ')
  const competitors = detectCompetitors(allText)

  try {
    const { rows } = await pool.query(
      `INSERT INTO research_entries
         (finding, context, source_firm, report_name, report_url, published_year,
          topics, audience_fit, incompass_relevance, opportunity_type, strength_rating,
          notes, incompass_angle, ai_generated, feed_item_id, competitors_mentioned)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        b.finding, b.context ?? null, b.source_firm, b.report_name ?? null,
        b.report_url ?? null, b.published_year ?? null,
        b.topics ?? [], b.audience_fit ?? [],
        b.incompass_relevance ?? null, b.opportunity_type ?? null,
        b.strength_rating ?? 3, b.notes ?? null, b.incompass_angle ?? null,
        b.ai_generated ?? false, b.feed_item_id ?? null,
        b.competitors_mentioned ?? competitors,
      ]
    )
    return Response.json({ data: rows[0] }, { status: 201 })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
