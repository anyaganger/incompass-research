export const runtime = 'nodejs'

export async function GET() {
  const key = process.env.GROK_API_KEY
  if (!key) return Response.json({ error: 'GROK_API_KEY not set' })

  try {
    const res = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        instructions: 'You are a research analyst. Search and return a brief JSON summary.',
        input: [
          {
            role: 'user',
            content: 'Search for: "leadership effectiveness CEO performance statistics 2024". Return JSON: {"relevant": true, "source_firm": "test", "report_name": "test", "findings": [{"finding": "test stat", "context": "test", "incompass_angle": "test", "topics": ["leadership_effectiveness"], "audience_fit": ["c_suite"], "incompass_relevance": "direct", "opportunity_type": "validates_product", "strength_rating": 4}]}',
          },
        ],
        tools: [{ type: 'web_search' }],
      }),
    })

    const status = res.status
    const data = await res.json()
    return Response.json({ status, data })
  } catch (e) {
    return Response.json({ error: String(e) })
  }
}
