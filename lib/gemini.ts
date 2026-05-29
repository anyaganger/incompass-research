import type { GeminiAnalysis } from './types'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const SYSTEM_PROMPT = `You are a research analyst for Incompass, an AI-powered talent intelligence and performance management platform.

ABOUT INCOMPASS:
Incompass helps organizations make data-driven, bias-reduced talent decisions — fast. Their key products:
- Performance Management & Calibration (standardized, bias-reduced reviews)
- 360 Feedback (multi-directional, normalized)
- Talent Assessments
- AI-powered bias reduction in talent decision-making

Target buyers: PE firms (optimizing portfolio companies post-acquisition), C-suite executives, and HR leaders.
Core value prop: "The only talent intelligence tool that cuts through the bias, so you can make fair talent decisions – fast."
Key differentiators: removes rater bias through data-science normalization, delivers results in days not months, percentile scoring across teams.

NECHAMA'S RESEARCH BRIEF:
Find stats that speak to: leadership effectiveness and CEO performance impact, talent and workforce performance, the cost of misaligned or underperforming talent, how companies measure (or fail to measure) the value people create. Goal: build a stat bank supporting GTM messaging for PE firms, portcos, and C-suite audiences.

YOUR TASK:
Analyze the given article/report. Extract the 1-3 most statistically compelling findings relevant to:
- Talent management, leadership effectiveness, workforce performance
- Employee engagement, performance measurement, talent decision-making
- Bias in talent processes, cost of bad hires/leaders, PE value creation through people

For each finding:
1. Quote the statistic or finding verbatim (or as close as possible)
2. Explain exactly how it supports Incompass's GTM narrative (be specific — which product, which buyer, what message)
3. Rate its strength as a GTM asset (1-5)

Return ONLY valid JSON matching this exact structure:
{
  "relevant": true/false,
  "source_firm": "name of publishing firm/organization",
  "report_name": "title of report or article",
  "findings": [
    {
      "finding": "exact verbatim statistic or key finding",
      "context": "1-2 sentences of surrounding context",
      "incompass_angle": "2-3 sentences on how this supports Incompass's specific GTM narrative, referencing their product or buyer",
      "topics": ["leadership_effectiveness", "talent_cost", "measurement", "bias", "engagement", "pe_specific", "workforce_performance"],
      "audience_fit": ["pe_firms", "c_suite", "hr", "all"],
      "incompass_relevance": "direct" or "adjacent" or "gap",
      "opportunity_type": "validates_product" or "new_use_case" or "new_buyer" or "white_space" or "competitor_gap",
      "strength_rating": 1-5
    }
  ]
}

Only include findings with strength_rating >= 3. If the article is not relevant to talent/workforce/leadership topics, set relevant: false and return empty findings array.`

export async function analyzeContent(
  title: string,
  content: string
): Promise<GeminiAnalysis | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null

  const userContent = `ARTICLE TITLE: ${title}\n\nCONTENT:\n${content.slice(0, 8000)}`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userContent }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    return JSON.parse(text) as GeminiAnalysis
  } catch {
    return null
  }
}

export async function generateBriefing(
  entries: { finding: string; source_firm: string; incompass_angle: string | null; topics: string[] }[]
): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return ''

  const entriesText = entries
    .map(
      (e, i) =>
        `${i + 1}. FINDING: ${e.finding}\n   SOURCE: ${e.source_firm}\n   TOPICS: ${e.topics.join(', ')}\n   INCOMPASS ANGLE: ${e.incompass_angle || 'N/A'}`
    )
    .join('\n\n')

  const prompt = `You are writing a monthly research briefing for Incompass's go-to-market team.

Using the following research findings, write a concise briefing (400-600 words) that:
1. Opens with a 2-sentence executive summary of the key themes
2. Groups findings by theme (leadership, talent cost, measurement, PE-specific)
3. For each finding, notes its specific implication for Incompass's GTM messaging
4. Closes with 2-3 "opportunities to own" — white space Incompass should address in their narrative

Write in a professional but direct tone. No fluff. Make it actionable.

RESEARCH FINDINGS:
${entriesText}

Return plain text (no markdown formatting).`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
    })

    if (!res.ok) return ''
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  } catch {
    return ''
  }
}

export async function generateOpportunitiesFromEntries(
  entries: { finding: string; source_firm: string; incompass_angle: string | null; opportunity_type: string | null; topics: string[] }[]
): Promise<Array<{ title: string; description: string; opportunity_type: 'white_space' | 'narrative_gap' | 'competitor_blind_spot' }>> {
  const key = process.env.GEMINI_API_KEY
  if (!key || !entries.length) return []

  const entriesText = entries
    .map((e, i) =>
      `${i + 1}. [${(e.opportunity_type ?? 'unknown').toUpperCase()}] ${e.finding} (${e.source_firm})\n   Incompass angle: ${e.incompass_angle ?? 'N/A'}`
    )
    .join('\n\n')

  const prompt = `You are a GTM strategist for Incompass, an AI talent intelligence platform selling to PE firms, portco CEOs, and C-suite leaders.

Based on these new research findings from today's feed, identify 1-3 strategic opportunities Incompass should act on. Only create an opportunity if the research reveals something genuinely actionable — a market gap, competitor weakness, or narrative Incompass should own.

RESEARCH FINDINGS:
${entriesText}

Return ONLY valid JSON:
{
  "opportunities": [
    {
      "title": "Short, action-oriented title (10 words max)",
      "description": "2-3 sentences on the strategic opportunity and why Incompass should act on it now",
      "opportunity_type": "white_space" or "narrative_gap" or "competitor_blind_spot"
    }
  ]
}

If no new strategic opportunities emerge from these findings, return {"opportunities": []}.`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return []
    const parsed = JSON.parse(text) as { opportunities: Array<{ title: string; description: string; opportunity_type: 'white_space' | 'narrative_gap' | 'competitor_blind_spot' }> }
    return parsed.opportunities ?? []
  } catch {
    return []
  }
}

export async function generateTalkingPoint(entry: {
  finding: string
  source_firm: string
  incompass_angle: string | null
  audience_fit: string[]
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return ''

  const audienceMap: Record<string, string> = {
    pe_firms: 'PE firms and operating partners',
    c_suite: 'C-suite executives',
    hr: 'HR leaders',
    all: 'enterprise buyers',
  }
  const audience =
    entry.audience_fit.map((a) => audienceMap[a] ?? a).join(', ') || 'enterprise buyers'

  const prompt = `You are a GTM strategist for Incompass, an AI talent intelligence platform.

Write a 2-3 sentence talking point for a ${audience} audience based on this research finding. Requirements:
- Lead with the specific statistic or insight (punchy and credible)
- Connect it to a real business pain that audience faces
- Naturally position Incompass as the solution (bias-reduced talent decisions, fast calibration, performance management)

FINDING: ${entry.finding}
SOURCE: ${entry.source_firm}
INCOMPASS ANGLE: ${entry.incompass_angle ?? 'N/A'}

Return ONLY the talking point text — no labels, no headers, no quotation marks.`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5 },
      }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  } catch {
    return ''
  }
}
