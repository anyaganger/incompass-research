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
      `UPDATE opportunities SET title=$1, description=$2, opportunity_type=$3,
       status=$4, supporting_entry_ids=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [b.title, b.description ?? null, b.opportunity_type ?? null, b.status, b.supporting_entry_ids ?? [], id]
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
    await pool.query('DELETE FROM opportunities WHERE id = $1', [id])
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
