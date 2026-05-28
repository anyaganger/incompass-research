export const runtime = 'nodejs'

export async function POST(req: Request) {
  const origin = new URL(req.url).origin
  const res = await fetch(`${origin}/api/feed/cron`, {
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
    },
  })
  const data = await res.json()
  return Response.json(data)
}
