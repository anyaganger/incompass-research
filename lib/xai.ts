import type { GeminiAnalysis } from './types'

const XAI_URL = 'https://api.x.ai/v1/responses'

const SYSTEM_INSTRUCTIONS = `You are a research analyst for Incompass, an AI-powered talent intelligence and performance management platform.

ABOUT INCOMPASS:
Incompass helps organizations make data-driven, bias-reduced talent decisions — fast. Core products: Performance Management & Calibration, 360 Feedback, Talent Assessments, AI-powered bias reduction.
Target buyers: PE firms (optimizing portfolio companies post-acquisition), C-suite executives, HR leaders.
Core value prop: "The only talent intelligence tool that cuts through the bias, so you can make fair talent decisions – fast."

YOUR TASK:
Analyze the posts/articles found by your search. Extract the 1-3 most compelling findings with concrete statistics, practitioner insights, or research data relevant to Incompass's GTM. Focus on: leadership effectiveness, talent cost, performance measurement, bias in talent decisions, PE value creation, workforce performance.

Return ONLY valid JSON matching this exact structure (no prose, no markdown, just JSON):
{
  "relevant": true,
  "source_firm": "name of author/org/publication",
  "report_name": "post title or search topic",
  "findings": [
    {
      "finding": "verbatim quote or close paraphrase of the key stat or claim",
      "context": "who said it, their role/company, approx engagement or reach if known",
      "incompass_angle": "2-3 sentences on how this supports Incompass's GTM — which product, which buyer, what message",
      "topics": ["leadership_effectiveness","talent_cost","measurement","bias","engagement","pe_specific","workforce_performance"],
      "audience_fit": ["pe_firms","c_suite","hr","all"],
      "incompass_relevance": "direct",
      "opportunity_type": "validates_product",
      "strength_rating": 4
    }
  ]
}

Only include findings with strength_rating >= 3. If nothing relevant is found, return {"relevant": false, "source_firm": "", "report_name": "", "findings": []}.`

const X_QUERIES = [
  'leadership effectiveness CEO performance impact on company results statistics',
  'cost of bad hire mis-hire executive failure rate research data',
  'performance management broken annual reviews ineffective talent',
  'private equity portfolio company talent management value creation',
  'bias in performance reviews unfair ratings talent decisions',
  'employee engagement workforce productivity measurement ROI',
]

const WEB_QUERIES = [
  'PE private equity talent management leadership portfolio company value creation 2025',
  'cost of executive mis-hire leadership failure statistics research 2025',
  'performance management broken workforce measurement data 2025',
]

async function callXAI(
  query: string,
  tool: Record<string, unknown>
): Promise<GeminiAnalysis | null> {
  const key = process.env.GROK_API_KEY
  if (!key) return null

  try {
    const res = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        instructions: SYSTEM_INSTRUCTIONS,
        input: [
          {
            role: 'user',
            content: `Search for: "${query}". Extract findings with concrete statistics or strong practitioner claims. Return only the JSON structure specified — no other text.`,
          },
        ],
        tools: [tool],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const text = (data?.output ?? [])
      .find((o: { role: string }) => o.role === 'assistant')
      ?.content
      ?.find((c: { type: string }) => c.type === 'text')
      ?.text as string | undefined

    if (!text) return null

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null

    return JSON.parse(match[0]) as GeminiAnalysis
  } catch {
    return null
  }
}

export async function searchXForFindings(): Promise<GeminiAnalysis[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const results = await Promise.all(
    X_QUERIES.map((q) =>
      callXAI(q, { type: 'x_search', from_date: thirtyDaysAgo })
    )
  )

  return results.filter(
    (r): r is GeminiAnalysis => r !== null && r.relevant && (r.findings?.length ?? 0) > 0
  )
}

export async function searchWebForFindings(allowedDomains?: string[]): Promise<GeminiAnalysis[]> {
  const tool: Record<string, unknown> = { type: 'web_search' }
  if (allowedDomains?.length) tool.allowed_domains = allowedDomains.slice(0, 5)

  const results = await Promise.all(
    WEB_QUERIES.map((q) => callXAI(q, tool))
  )

  return results.filter(
    (r): r is GeminiAnalysis => r !== null && r.relevant && (r.findings?.length ?? 0) > 0
  )
}
