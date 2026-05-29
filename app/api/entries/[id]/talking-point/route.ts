export const runtime = 'nodejs'
import { getDb } from '@/lib/db'
import { generateTalkingPoint } from '@/lib/gemini'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pool = getDb()
  try {
    const { rows } = await pool.query(
      'SELECT * FROM research_entries WHERE id = $1',
      [id]
    )
    if (!rows[0]) return Response.json({ error: 'Not found' }, { status: 404 })
    const tp = await generateTalkingPoint(rows[0])
    if (!tp) return Response.json({ error: 'Generation failed' }, { status: 500 })
    return Response.json({ talking_point: tp })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
