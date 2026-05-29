export const COMPETITORS = [
  'Workday', 'Lattice', '15Five', 'SuccessFactors', 'BambooHR',
  'Rippling', 'Culture Amp', 'Leapsome', 'Betterworks', 'TriNet',
  'Korn Ferry', 'Mercer', 'Heidrick',
]

export function detectCompetitors(text: string): string[] {
  const lower = text.toLowerCase()
  return COMPETITORS.filter((c) => lower.includes(c.toLowerCase()))
}

export const WEIGHTED_SCORE_SQL = `ROUND((
  strength_rating
  + GREATEST(COALESCE(votes_up, 0) - COALESCE(votes_down, 0), 0)::numeric * 0.5
  + CASE WHEN published_year >= 2024 THEN 1.0 ELSE 0.0 END
  + CASE WHEN incompass_relevance = 'direct'   THEN 1.0
         WHEN incompass_relevance = 'adjacent' THEN 0.5
         ELSE 0.0 END
)::numeric, 1) AS weighted_score`
