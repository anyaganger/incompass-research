export const runtime = 'nodejs'

import { getDb } from '@/lib/db'
import { searchXForFindings, searchWebForFindings, xaiErrors } from '@/lib/xai'
import { generateOpportunitiesFromEntries } from '@/lib/gemini'

export async function POST() {
  if (!process.env.GROK_API_KEY) {
    return Response.json({ error: 'GROK_API_KEY not configured' }, { status: 503 })
  }

  const pool = getDb()
  let totalAdded = 0
  const newEntries: {
    finding: string
    source_firm: string
    incompass_angle: string | null
    opportunity_type: string | null
    topics: string[]
  }[] = []

  const [xResults, webResults] = await Promise.all([
    searchXForFindings(),
    searchWebForFindings(),
  ])

  for (const analysis of [...xResults, ...webResults]) {
    for (const finding of (analysis.findings ?? []).filter((f) => f.strength_rating >= 3)) {
      await pool.query(
        `INSERT INTO research_entries
           (finding, context, source_firm, report_name,
            topics, audience_fit, incompass_relevance, opportunity_type,
            strength_rating, incompass_angle, ai_generated)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          finding.finding,
          finding.context ?? null,
          analysis.source_firm || 'X / Social',
          analysis.report_name || null,
          finding.topics ?? [],
          finding.audience_fit ?? [],
          finding.incompass_relevance ?? null,
          finding.opportunity_type ?? null,
          finding.strength_rating,
          finding.incompass_angle ?? null,
          true,
        ]
      )
      newEntries.push({
        finding: finding.finding,
        source_firm: analysis.source_firm || 'X / Social',
        incompass_angle: finding.incompass_angle ?? null,
        opportunity_type: finding.opportunity_type ?? null,
        topics: finding.topics ?? [],
      })
      totalAdded++
    }
  }

  const opportunityEntries = newEntries.filter((e) =>
    ['white_space', 'competitor_gap', 'new_use_case', 'new_buyer'].includes(
      e.opportunity_type ?? ''
    )
  )
  if (opportunityEntries.length > 0) {
    const opportunities = await generateOpportunitiesFromEntries(opportunityEntries)
    for (const opp of opportunities) {
      await pool.query(
        `INSERT INTO opportunities (title, description, opportunity_type, status) VALUES ($1,$2,$3,'active')`,
        [opp.title, opp.description, opp.opportunity_type]
      )
    }
  }

  return Response.json({
    ok: true,
    added: totalAdded,
    x: xResults.length,
    web: webResults.length,
    debug: xaiErrors.slice(-5),
  })
}
