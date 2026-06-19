import type { GeminiAnalysis } from './types'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const SYSTEM_PROMPT = `You are a research analyst for Incompass, an AI-powered talent intelligence platform purpose-built for private equity.

ABOUT INCOMPASS:
Incompass helps PE firms and their portfolio companies make data-driven, bias-reduced talent decisions — fast. Their key products:
- Performance Management & Calibration (standardized, bias-reduced reviews — delivers results in days, not months)
- 360 Feedback (multi-directional, normalized scores that are comparable across portcos)
- Talent Assessments for deal diligence and leadership bench strength
- AI-powered bias reduction so PE firms can trust talent data the way they trust financial data

CORE POSITIONING: Every competitor (Workday, Lattice, 15Five, Culture Amp, BambooHR, SuccessFactors) is built for and sold to HR departments. Incompass is the only platform that speaks PE language — translating people data into EBITDA impact, value creation levers, and portfolio-level leadership risk. This is the white space Incompass owns.

Target buyers (in priority order):
1. PE operating partners and deal teams (talent diligence, value creation plans, 100-day assessments)
2. Portco CEOs and their boards (who's the right leader, how do you build the team that hits the investment thesis)
3. C-suite executives (unbiased performance data to make fast leadership decisions)

NECHAMA'S RESEARCH BRIEF:
Build a stat bank that makes the case to PE buyers. Priority stats: (1) the financial cost of leadership misalignment in portcos, (2) how bias in talent decisions destroys value — PE firms get burned by promoting wrong leaders, (3) how slow or broken talent measurement fails at the speed PE operates, (4) why HR tools miss the PE use case entirely.

YOUR TASK:
Analyze the given article/report. Extract the 1-3 most statistically compelling findings. For each, write the Incompass angle specifically for a PE audience — use PE language (portco, hold period, EBITDA impact, operating partner, value creation, deal thesis, succession risk). Avoid generic HR framing.

Return ONLY valid JSON matching this exact structure:
{
  "relevant": true/false,
  "source_firm": "name of publishing firm/organization",
  "report_name": "title of report or article",
  "findings": [
    {
      "finding": "exact verbatim statistic or key finding",
      "context": "1-2 sentences of surrounding context",
      "incompass_angle": "2-3 sentences framed for a PE operating partner or portco CEO — what deal or value creation decision does this affect, and how does Incompass solve it better than any HR tool?",
      "topics": ["leadership_effectiveness", "talent_cost", "measurement", "bias", "engagement", "pe_specific", "workforce_performance"],
      "audience_fit": ["pe_firms", "c_suite", "hr", "all"],
      "incompass_relevance": "direct" or "adjacent" or "gap",
      "opportunity_type": "validates_product" or "new_use_case" or "new_buyer" or "white_space" or "competitor_gap",
      "strength_rating": 1-5
    }
  ]
}

Only include findings with strength_rating >= 3. If the article is not relevant to talent/workforce/leadership/PE topics, set relevant: false and return empty findings array.`

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

  const prompt = `You are writing a PE-focused intelligence briefing for Incompass's go-to-market team.

CONTEXT: Incompass is an AI talent intelligence platform. Its core positioning is that every competitor (Workday, Lattice, 15Five, Culture Amp) sells to HR departments. Incompass sells to PE firms and portco leadership — people who think in EBITDA, value creation plans, hold periods, and deal diligence, not HR processes. This briefing should reinforce that positioning.

Using the following research findings, write a concise briefing (400-600 words) that:
1. Opens with a 2-sentence executive summary framed for a PE audience (investment thesis language, not HR language)
2. Groups findings by theme (leadership ROI, talent cost to portcos, measurement gaps, PE-specific opportunities)
3. For each finding, explains exactly why this matters to a PE operating partner or portco CEO — what deal decision, value creation lever, or portfolio risk it speaks to
4. Closes with 2-3 "narrative gaps to own" — specific angles where Incompass can make the case that HR tools miss the PE buyer entirely

Write in a professional, direct, data-driven tone. Use PE language (portco, hold period, value creation, EBITDA, operating partner, deal diligence). No fluff. Make it a compelling briefing Nechama can send to investors or use in a pitch.

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

export type ContentFormat = 'linkedin' | 'newsletter' | 'article'

export async function generateContent(
  format: ContentFormat,
  findings: { finding: string; source_firm: string; published_year: number | null; report_url: string | null; incompass_angle: string | null; topics: string[] }[],
  angle?: string
): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key || !findings.length) return ''

  const findingsText = findings
    .map((f, i) => {
      const citation = f.published_year ? `${f.source_firm} ${f.published_year}` : f.source_firm
      return `${i + 1}. "${f.finding}" — ${citation}${f.incompass_angle ? `\n   PE angle: ${f.incompass_angle}` : ''}`
    })
    .join('\n\n')

  const angleNote = angle ? `\nNARRATIVE ANGLE / TOPIC: ${angle}\n` : ''

  const formatInstructions: Record<ContentFormat, string> = {
    linkedin: `Write a LinkedIn post for Nechama Jacobson, CEO of Incompass. Format:
- 150–250 words total
- Open with a punchy, data-backed hook — one stat that stops the scroll
- 2–3 short paragraphs that build the argument using the research data
- Frame everything for a PE or C-suite audience: portcos, hold periods, EBITDA, value creation
- Close with 1–2 sentences positioning Incompass — the only talent intelligence tool built for PE, not HR
- Add 3–4 relevant hashtags at the end (#PrivateEquity #TalentIntelligence #Leadership #PE)
- Do NOT use emojis. Keep the tone direct, credible, founder-voice.
- Cite each stat inline like this: (Gallup, 2026) or (Deloitte Global Human Capital Trends, 2026)`,

    newsletter: `Write a newsletter issue for Incompass's "PE Talent Intelligence" newsletter. Format:
- Subject line on its own line: "Subject: ..."
- Preview text on its own line: "Preview: ..."
- 450–650 words of body copy
- Open with a 2-sentence executive summary framed for PE operating partners
- Group findings into 2–3 themed sections with short section headers
- Each section: 1 key finding with context, then the Incompass angle (what this means for portco operations, value creation, or deal diligence)
- Close with a "So What for PE" paragraph — 2–3 actionable takeaways
- Professional, data-driven tone. No fluff. PE language throughout (portco, hold period, EBITDA, succession risk, talent diligence).
- Cite each stat inline: (Source, Year)`,

    article: `Write a thought leadership article for Nechama Jacobson, CEO of Incompass. Format:
- Headline on its own line: "Headline: ..."
- 700–950 words
- Strong thesis in the opening paragraph: PE firms are sitting on a talent risk they can't see yet
- Weave 4–6 research findings throughout as evidence — not a list, but integrated into the argument
- Build to the case that HR tools are structurally wrong for PE (they report to HR, not the investment team)
- Position Incompass as the solution in the final section — 1 paragraph, not salesy, just logical
- Byline-ready tone: authoritative, first-person perspective from a PE talent expert
- Cite each stat inline: (Source, Year)`,
  }

  const prompt = `${formatInstructions[format]}
${angleNote}
RESEARCH FINDINGS FROM INCOMPASS DATABASE:
${findingsText}

Write ONLY the content — no preamble, no "here is your draft", no meta-commentary. Output the content itself, ready to publish.`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6 },
      }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  } catch {
    return ''
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

  const isPE = entry.audience_fit.includes('pe_firms')

  const prompt = `You are a GTM strategist for Incompass — the only talent intelligence platform purpose-built for private equity.

Write a 2-3 sentence talking point for a ${audience} audience based on this research finding. Requirements:
- Lead with the specific statistic or insight (punchy and credible)
${isPE
  ? '- Frame the business pain in PE language: what does this cost at the portco level? What deal decision, value creation plan, or leadership risk does this create?\n- Position Incompass as the solution that speaks PE language — unlike HR tools (Workday, Lattice, 15Five) that give you engagement scores with no financial translation'
  : '- Connect it to a real business pain that audience faces\n- Naturally position Incompass as the solution (bias-reduced talent decisions, fast calibration, performance management that HR tools can\'t provide to PE-speed operators)'
}

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
