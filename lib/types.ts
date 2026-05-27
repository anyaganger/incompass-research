export interface ResearchEntry {
  id: string
  created_at: string
  updated_at: string
  finding: string
  context: string | null
  source_firm: string
  report_name: string | null
  report_url: string | null
  published_year: number | null
  topics: string[]
  audience_fit: string[]
  incompass_relevance: 'direct' | 'adjacent' | 'gap' | null
  opportunity_type: 'validates_product' | 'new_use_case' | 'new_buyer' | 'white_space' | 'competitor_gap' | null
  strength_rating: number
  notes: string | null
  incompass_angle: string | null
  ai_generated: boolean
  feed_item_id: string | null
}

export interface FeedSource {
  id: string
  created_at: string
  name: string
  url: string
  active: boolean
  keywords: string[]
  last_fetched: string | null
}

export interface FeedItem {
  id: string
  created_at: string
  source_id: string | null
  title: string | null
  url: string | null
  published_at: string | null
  raw_content: string | null
  ai_analysis: GeminiAnalysis | null
  relevance_score: number | null
  added_to_db: boolean
  entry_id: string | null
  feed_sources?: { name: string }
}

export interface GeminiAnalysis {
  relevant: boolean
  findings: GeminiFinding[]
  source_firm: string
  report_name: string
}

export interface GeminiFinding {
  finding: string
  context: string
  incompass_angle: string
  topics: string[]
  audience_fit: string[]
  incompass_relevance: 'direct' | 'adjacent' | 'gap'
  opportunity_type: string
  strength_rating: number
}

export interface Opportunity {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  opportunity_type: 'white_space' | 'narrative_gap' | 'competitor_blind_spot' | null
  status: 'active' | 'addressed' | 'monitoring'
  supporting_entry_ids: string[]
}

export const TOPICS = [
  { value: 'leadership_effectiveness', label: 'Leadership Effectiveness' },
  { value: 'talent_cost', label: 'Talent Cost' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'bias', label: 'Bias & Fairness' },
  { value: 'engagement', label: 'Employee Engagement' },
  { value: 'pe_specific', label: 'PE-Specific' },
  { value: 'workforce_performance', label: 'Workforce Performance' },
]

export const AUDIENCE_FIT = [
  { value: 'pe_firms', label: 'PE Firms' },
  { value: 'c_suite', label: 'C-Suite' },
  { value: 'hr', label: 'HR' },
  { value: 'all', label: 'All' },
]

export const INCOMPASS_RELEVANCE = [
  { value: 'direct', label: 'Direct — Incompass solves this' },
  { value: 'adjacent', label: 'Adjacent — Related to Incompass' },
  { value: 'gap', label: 'Gap — No market solution yet' },
]

export const OPPORTUNITY_TYPES = [
  { value: 'validates_product', label: 'Validates Product' },
  { value: 'new_use_case', label: 'New Use Case' },
  { value: 'new_buyer', label: 'New Buyer Type' },
  { value: 'white_space', label: 'White Space (Biggest opportunity)' },
  { value: 'competitor_gap', label: 'Competitor Gap' },
]
