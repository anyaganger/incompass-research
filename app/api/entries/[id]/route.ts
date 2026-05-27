import { getDb } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pool = getDb()
  try {
    const { rows } = await pool.query('SELECT * FROM research_entries WHERE id = $1', [id])
    if (!rows[0]) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ data: rows[0] })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const b = await req.json()
  const pool = getDb()
  try {
    const { rows } = await pool.query(
      `UPDATE research_entries SET
         finding=$1, context=$2, source_firm=$3, report_name=$4, report_url=$5,
         published_year=$6, topics=$7, audience_fit=$8, incompass_relevance=$9,
         opportunity_type=$10, strength_rating=$11, notes=$12, incompass_angle=$13,
         updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [
        b.finding, b.context ?? null, b.source_firm, b.report_name ?? null,
        b.report_url ?? null, b.published_year ?? null, b.topics ?? [],
        b.audience_fit ?? [], b.incompass_relevance ?? null,
        b.opportunity_type ?? null, b.strength_rating ?? 3,
        b.notes ?? null, b.incompass_angle ?? null, id,
      ]
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
    await pool.query('DELETE FROM research_entries WHERE id = $1', [id])
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
