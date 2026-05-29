import { getDb } from '@/lib/db'

export async function GET() {
  const pool = getDb()
  try {
    const [oppsRes, trendingRes] = await Promise.all([
      pool.query('SELECT * FROM opportunities ORDER BY created_at DESC'),
      pool.query(`
        SELECT opportunity_type, COUNT(*)::int AS count
        FROM research_entries
        WHERE created_at >= NOW() - INTERVAL '30 days'
          AND opportunity_type IS NOT NULL
        GROUP BY opportunity_type
        HAVING COUNT(*) >= 3
      `),
    ])
    const trending_types = (trendingRes.rows as { opportunity_type: string }[]).map(
      (r) => r.opportunity_type
    )
    return Response.json({ data: oppsRes.rows, trending_types })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const b = await req.json()
  const pool = getDb()
  try {
    const { rows } = await pool.query(
      `INSERT INTO opportunities (title, description, opportunity_type, status, supporting_entry_ids)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [b.title, b.description ?? null, b.opportunity_type ?? null, b.status ?? 'active', b.supporting_entry_ids ?? []]
    )
    return Response.json({ data: rows[0] }, { status: 201 })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
