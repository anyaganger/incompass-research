import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const pool = getDb()
  try {
    const { rows } = await pool.query(
      `SELECT fi.*, fs.name AS source_name
       FROM feed_items fi
       LEFT JOIN feed_sources fs ON fs.id = fi.source_id
       ORDER BY fi.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return Response.json({ data: rows })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
