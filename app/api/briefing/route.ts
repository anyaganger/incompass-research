import { generateBriefing } from '@/lib/gemini'

export async function POST(req: Request) {
  const { entries } = await req.json()
  if (!entries?.length) return Response.json({ briefing: '' })
  try {
    const briefing = await generateBriefing(entries)
    return Response.json({ briefing })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
