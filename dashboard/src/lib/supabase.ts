import { createClient } from '@supabase/supabase-js'
import type { Client, ContentPiece, CrawledPage, ContentOpportunity, PerformanceMetric } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Clients
export const clientsApi = {
  list: () => supabase.from('clients').select('*').order('name'),
  get: (id: string) => supabase.from('clients').select('*').eq('id', id).single(),
  create: (data: Omit<Client, 'id' | 'created_at'>) =>
    supabase.from('clients').insert(data).select().single(),
  update: (id: string, data: Partial<Client>) =>
    supabase.from('clients').update(data).eq('id', id).select().single(),
  delete: (id: string) => supabase.from('clients').delete().eq('id', id),
}

// Content
export const contentApi = {
  list: (clientId: string) =>
    supabase
      .from('content_pieces')
      .select('*')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false }),
  get: (id: string) => supabase.from('content_pieces').select('*').eq('id', id).single(),
  create: (data: Omit<ContentPiece, 'id' | 'created_at' | 'updated_at'>) =>
    supabase.from('content_pieces').insert(data).select().single(),
  update: (id: string, data: Partial<ContentPiece>) =>
    supabase
      .from('content_pieces')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
  delete: (id: string) => supabase.from('content_pieces').delete().eq('id', id),
}

// Crawled pages
export const crawlApi = {
  list: (clientId: string) =>
    supabase
      .from('crawled_pages')
      .select('*')
      .eq('client_id', clientId)
      .order('crawled_at', { ascending: false }),
  create: (data: Omit<CrawledPage, 'id' | 'crawled_at'>) =>
    supabase.from('crawled_pages').insert(data).select().single(),
  bulkCreate: (data: Omit<CrawledPage, 'id' | 'crawled_at'>[]) =>
    supabase.from('crawled_pages').insert(data).select(),
  deleteByClient: (clientId: string) =>
    supabase.from('crawled_pages').delete().eq('client_id', clientId),
}

// Opportunities
export const opportunitiesApi = {
  list: (clientId: string) =>
    supabase
      .from('content_opportunities')
      .select('*')
      .eq('client_id', clientId)
      .order('opportunity_score', { ascending: false }),
  create: (data: Omit<ContentOpportunity, 'id' | 'created_at'>) =>
    supabase.from('content_opportunities').insert(data).select().single(),
  update: (id: string, data: Partial<ContentOpportunity>) =>
    supabase.from('content_opportunities').update(data).eq('id', id).select().single(),
}

// Performance metrics
export const metricsApi = {
  list: (clientId: string) =>
    supabase
      .from('performance_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .limit(90),
  summary: (clientId: string) =>
    supabase
      .from('performance_metrics')
      .select('impressions, clicks, ctr, avg_position')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .limit(30),
  upsert: (data: Omit<PerformanceMetric, 'id'>[]) =>
    supabase.from('performance_metrics').upsert(data),
}
