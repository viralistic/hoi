import { useMemo } from 'react'
import { analyzeSeo, countKeyword } from '@/lib/seo-analyzer'
import type { SeoScore } from '@/types'

interface UseSeoScoreParams {
  html: string
  targetKeyword: string
  relatedKeywords: string[]
  metaTitle?: string
  metaDescription?: string
  targetWordCount?: number
}

export function useSeoScore(params: UseSeoScoreParams): SeoScore {
  return useMemo(() => {
    return analyzeSeo(params)
  }, [params.html, params.targetKeyword, params.relatedKeywords.join(','), params.metaTitle, params.metaDescription, params.targetWordCount])
}

export function useKeywordCounts(html: string, keywords: string[]): Record<string, number> {
  return useMemo(() => {
    const counts: Record<string, number> = {}
    for (const kw of keywords) {
      counts[kw] = countKeyword(html, kw)
    }
    return counts
  }, [html, keywords.join(',')])
}
