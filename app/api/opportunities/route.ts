import { getDb } from '@/lib/db'

export async function GET() {
  const pool = getDb()
  try {
    const { rows } = await pool.query('SELECT * FROM opportunities ORDER BY created_at DESC')
    return Response.json({ data: rows })
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
