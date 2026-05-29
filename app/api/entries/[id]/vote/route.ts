export const runtime = 'nodejs'
import { getDb } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { vote } = (await req.json()) as { vote: 'up' | 'down' }
  if (vote !== 'up' && vote !== 'down') {
    return Response.json({ error: 'Invalid vote' }, { status: 400 })
  }
  const col = vote === 'up' ? 'votes_up' : 'votes_down'
  const pool = getDb()
  try {
    const { rows } = await pool.query(
      `UPDATE research_entries
       SET ${col} = COALESCE(${col}, 0) + 1, updated_at = NOW()
       WHERE id = $1
       RETURNING votes_up, votes_down`,
      [id]
    )
    if (!rows[0]) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ data: rows[0] })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
