import type { GeminiAnalysis } from './types'

const XAI_URL = 'https://api.x.ai/v1/responses'

const SYSTEM_INSTRUCTIONS = `You are a research analyst for Incompass, an AI-powered talent intelligence and performance management platform.

ABOUT INCOMPASS:
Incompass helps organizations make data-driven, bias-reduced talent decisions — fast. Core products: Performance Management & Calibration, 360 Feedback, Talent Assessments, AI-powered bias reduction.
Target buyers: PE firms (optimizing portfolio companies post-acquisition), C-suite executives, HR leaders.
Core value prop: "The only talent intelligence tool that cuts through the bias, so you can make fair talent decisions – fast."

YOUR TASK:
Search the web for the given query. Extract the 1-3 most compelling findings with concrete statistics, practitioner insights, or research data relevant to Incompass's GTM. Focus on: leadership effectiveness, talent cost, performance measurement, bias in talent decisions, PE value creation, workforce performance.

Return ONLY valid JSON matching this exact structure (no prose, no markdown, just JSON):
{
  "relevant": true,
  "source_firm": "name of author/org/publication",
  "report_name": "post title or search topic",
  "findings": [
    {
      "finding": "verbatim quote or close paraphrase of the key stat or claim",
      "context": "who said it, their role/company, publication date if known",
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

// All queries use web_search — x_search is not a supported tool per xAI docs
const ALL_QUERIES = [
  'leadership effectiveness CEO performance impact company results statistics research 2024 2025',
  'cost of bad hire mis-hire executive failure rate research statistics',
  'performance management broken annual reviews ineffective talent measurement',
  'private equity portfolio company talent management value creation people',
  'bias in performance reviews unfair ratings talent decisions research data',
  'employee engagement workforce productivity measurement ROI statistics',
  'PE private equity talent leadership portco value creation 2025',
  'cost executive mis-hire leadership failure statistics research',
  'workforce performance measurement data HR analytics 2025',
]

// Exported so social route can surface errors for debugging
export const xaiErrors: string[] = []

async function callXAI(query: string): Promise<GeminiAnalysis | null> {
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
        model: 'grok-4.3',
        instructions: SYSTEM_INSTRUCTIONS,
        input: [
          {
            role: 'user',
            content: `Search for: "${query}". Extract findings with concrete statistics or strong practitioner claims. Return only the JSON structure specified — no other text.`,
          },
        ],
        tools: [{ type: 'web_search' }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      xaiErrors.push(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
      return null
    }

    // xAI Responses API: output is an array of items; find the assistant message
    const outputItems: Record<string, unknown>[] = data?.output ?? []
    const msgItem =
      outputItems.find((o) => o.role === 'assistant') ??
      outputItems.find((o) => o.type === 'message')
    const contentArr: Record<string, unknown>[] = Array.isArray(msgItem?.content)
      ? (msgItem!.content as Record<string, unknown>[])
      : []
    const text = (
      contentArr.find((c) => c.type === 'text' || c.type === 'output_text')?.text ??
      (typeof msgItem?.content === 'string' ? msgItem.content : undefined)
    ) as string | undefined

    if (!text) {
      xaiErrors.push(
        `No text. Keys: ${Object.keys(data).join(',')} | items: ${outputItems.length} | first: ${JSON.stringify(outputItems[0] ?? {}).slice(0, 200)}`
      )
      return null
    }

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      xaiErrors.push(`No JSON in text: ${text.slice(0, 200)}`)
      return null
    }

    return JSON.parse(match[0]) as GeminiAnalysis
  } catch (e) {
    xaiErrors.push(`Exception: ${String(e)}`)
    return null
  }
}

export async function searchXForFindings(): Promise<GeminiAnalysis[]> {
  const results = await Promise.all(ALL_QUERIES.slice(0, 6).map((q) => callXAI(q)))
  return results.filter(
    (r): r is GeminiAnalysis => r !== null && r.relevant && (r.findings?.length ?? 0) > 0
  )
}

export async function searchWebForFindings(): Promise<GeminiAnalysis[]> {
  const results = await Promise.all(ALL_QUERIES.slice(6).map((q) => callXAI(q)))
  return results.filter(
    (r): r is GeminiAnalysis => r !== null && r.relevant && (r.findings?.length ?? 0) > 0
  )
}
