import { getDb } from '@/lib/db'

export async function GET() {
  const pool = getDb()
  try {
    const { rows } = await pool.query('SELECT * FROM feed_sources ORDER BY name')
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
      'INSERT INTO feed_sources (name, url, active, keywords) VALUES ($1,$2,$3,$4) RETURNING *',
      [b.name, b.url, b.active ?? true, b.keywords ?? []]
    )
    return Response.json({ data: rows[0] }, { status: 201 })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
