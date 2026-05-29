// Web search via Gemini Google Search grounding — free, no xAI credits needed
import type { GeminiAnalysis } from './types'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const SYSTEM_INSTRUCTIONS = `You are a research analyst for Incompass, an AI-powered talent intelligence and performance management platform.

ABOUT INCOMPASS:
Incompass helps organizations make data-driven, bias-reduced talent decisions — fast. Core products: Performance Management & Calibration, 360 Feedback, Talent Assessments, AI-powered bias reduction.
Target buyers: PE firms (optimizing portfolio companies post-acquisition), C-suite executives, HR leaders.
Core value prop: "The only talent intelligence tool that cuts through the bias, so you can make fair talent decisions – fast."

YOUR TASK:
Use web search to find recent articles, research, or data on the given query. Extract the 1-3 most compelling findings with concrete statistics, practitioner insights, or research data relevant to Incompass's GTM. Focus on: leadership effectiveness, talent cost, performance measurement, bias in talent decisions, PE value creation, workforce performance.

Return ONLY valid JSON matching this exact structure (no prose, no markdown, just JSON):
{
  "relevant": true,
  "source_firm": "name of author/org/publication",
  "report_name": "post title or article name",
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

const SEARCH_QUERIES = [
  'leadership effectiveness CEO performance impact on company results statistics 2024 2025',
  'cost of bad hire mis-hire executive failure rate research data statistics',
  'performance management broken annual reviews ineffective workforce 2025',
  'private equity portfolio company talent management value creation people',
  'bias in performance reviews unfair ratings talent decisions research',
  'employee engagement workforce productivity measurement ROI data',
  'PE private equity talent leadership portco operating partner 2025',
  'workforce performance measurement HR analytics data research 2025',
  'cost executive mis-hire leadership failure statistics recent research',
]

export const xaiErrors: string[] = []

async function searchWithGemini(query: string): Promise<GeminiAnalysis | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
        contents: [
          {
            parts: [
              {
                text: `Search for recent data on: "${query}". Extract findings with concrete statistics or strong practitioner claims. Return only the JSON structure specified — no other text.`,
              },
            ],
          },
        ],
        tools: [
          {
            google_search_retrieval: {
              dynamic_retrieval_config: {
                mode: 'MODE_DYNAMIC',
                dynamic_threshold: 0.3,
              },
            },
          },
        ],
        generationConfig: { temperature: 0.2 },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      xaiErrors.push(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
      return null
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
    if (!text) {
      xaiErrors.push(`No text in Gemini response for query: ${query.slice(0, 60)}`)
      return null
    }

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      xaiErrors.push(`No JSON found in response: ${text.slice(0, 150)}`)
      return null
    }

    return JSON.parse(match[0]) as GeminiAnalysis
  } catch (e) {
    xaiErrors.push(`Exception for "${query.slice(0, 40)}": ${String(e)}`)
    return null
  }
}

export async function searchXForFindings(): Promise<GeminiAnalysis[]> {
  const results = await Promise.all(SEARCH_QUERIES.slice(0, 6).map(searchWithGemini))
  return results.filter(
    (r): r is GeminiAnalysis => r !== null && r.relevant && (r.findings?.length ?? 0) > 0
  )
}

export async function searchWebForFindings(): Promise<GeminiAnalysis[]> {
  const results = await Promise.all(SEARCH_QUERIES.slice(6).map(searchWithGemini))
  return results.filter(
    (r): r is GeminiAnalysis => r !== null && r.relevant && (r.findings?.length ?? 0) > 0
  )
}
