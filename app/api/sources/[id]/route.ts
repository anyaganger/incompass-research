import { getDb } from '@/lib/db'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const b = await req.json()
  const pool = getDb()
  try {
    const { rows } = await pool.query(
      'UPDATE feed_sources SET name=$1, url=$2, active=$3, keywords=$4 WHERE id=$5 RETURNING *',
      [b.name, b.url, b.active, b.keywords ?? [], id]
    )
    return Response.json({ data: rows[0] })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pool = getDb()
  try {
    await pool.query('DELETE FROM feed_sources WHERE id = $1', [id])
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
