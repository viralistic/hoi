export interface Client {
  id: string
  created_at: string
  name: string
  slug: string
  website_url?: string
  notion_id?: string
  brand_script?: BrandScript
  tone_of_voice?: string
  segments?: Segment[]
  main_keywords?: string[]
  extra_keywords?: string[]
  json_schema_presets?: Record<string, unknown>
  logo_url?: string
}

export interface BrandScript {
  character?: string        // Who is the customer / hero?
  problem_external?: string // External problem they face
  problem_internal?: string // Internal frustration
  problem_philosophical?: string
  guide?: string            // How the brand positions as guide
  plan?: string             // The plan/steps
  cta?: string              // Call to action
  failure?: string          // What happens if they don't act
  success?: string          // The success / transformation
}

export interface Segment {
  name: string
  description?: string
}

export interface ContentPiece {
  id: string
  client_id: string
  created_at: string
  updated_at: string
  title: string
  slug?: string
  content?: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  content_type: 'blog' | 'page' | 'social' | 'email' | 'landing'
  target_keyword?: string
  meta_title?: string
  meta_description?: string
  word_count?: number
  seo_score?: number
  live_url?: string
  ai_generated?: boolean
}

export interface KeywordAnalysis {
  id: string
  content_id: string
  keyword: string
  target_count: number
  actual_count: number
  density: number
}

export interface CrawledPage {
  id: string
  client_id: string
  crawled_at: string
  url: string
  title?: string
  h1?: string
  h2s?: string[]
  meta_description?: string
  content_text?: string
  word_count?: number
  status_code?: number
}

export interface ContentOpportunity {
  id: string
  client_id: string
  created_at: string
  title: string
  target_keyword?: string
  estimated_volume?: number
  difficulty?: number
  opportunity_score?: number
  status: 'pending' | 'in_progress' | 'published' | 'dismissed'
}

export interface PerformanceMetric {
  id: string
  client_id: string
  content_id?: string
  date: string
  url?: string
  impressions: number
  clicks: number
  ctr: number
  avg_position: number
  source: string
}

export interface SeoScore {
  total: number
  keywordDensity: number
  headingUsage: number
  metaCompleteness: number
  wordCountScore: number
  relatedTerms: number
  details: {
    wordCount: number
    targetWordCount: number
    h1Count: number
    h2Count: number
    keywordFrequency: Record<string, number>
  }
}
