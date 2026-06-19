export const runtime = 'nodejs'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { vote } = (await req.json()) as { vote: 'up' | 'down' }
  if (vote !== 'up' && vote !== 'down') {
    return Response.json({ error: 'Invalid vote' }, { status: 400 })
  }

  // Get user's display name
  const user = await currentUser()
  const userName =
    user?.firstName
      ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
      : (user?.emailAddresses[0]?.emailAddress ?? 'Unknown')

  const pool = getDb()
  try {
    // Upsert vote — one vote per user per entry (toggle if same type, replace if different)
    const existing = await pool.query(
      'SELECT vote_type FROM entry_votes WHERE entry_id = $1 AND clerk_user_id = $2',
      [id, userId]
    )

    if (existing.rows[0]?.vote_type === vote) {
      // Same vote again = remove it (toggle off)
      await pool.query(
        'DELETE FROM entry_votes WHERE entry_id = $1 AND clerk_user_id = $2',
        [id, userId]
      )
    } else {
      // New vote or changed vote
      await pool.query(
        `INSERT INTO entry_votes (entry_id, clerk_user_id, user_name, vote_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (entry_id, clerk_user_id) DO UPDATE SET vote_type = $4, user_name = $3`,
        [id, userId, userName, vote]
      )
    }

    // Recompute vote counts from the votes table
    const { rows } = await pool.query(
      `UPDATE research_entries SET
         votes_up   = (SELECT COUNT(*) FROM entry_votes WHERE entry_id = $1 AND vote_type = 'up'),
         votes_down = (SELECT COUNT(*) FROM entry_votes WHERE entry_id = $1 AND vote_type = 'down'),
         updated_at = NOW()
       WHERE id = $1
       RETURNING votes_up, votes_down`,
      [id]
    )
    if (!rows[0]) return Response.json({ error: 'Not found' }, { status: 404 })

    // Return counts + user's current vote
    const voteRow = await pool.query(
      'SELECT vote_type FROM entry_votes WHERE entry_id = $1 AND clerk_user_id = $2',
      [id, userId]
    )

    return Response.json({
      data: {
        ...rows[0],
        my_vote: voteRow.rows[0]?.vote_type ?? null,
      },
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
