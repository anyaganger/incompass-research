import crypto from 'crypto'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (password !== process.env.SITE_PASSWORD) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = crypto
    .createHash('sha256')
    .update((process.env.SITE_PASSWORD ?? '') + (process.env.AUTH_SECRET ?? ''))
    .digest('hex')

  const isSecure = process.env.NODE_ENV === 'production'
  const cookieValue = `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${isSecure ? '; Secure' : ''}`

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieValue,
    },
  })
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'auth-token=; Path=/; HttpOnly; Max-Age=0',
    },
  })
}
