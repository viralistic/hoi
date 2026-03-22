import type { SeoScore } from '@/types'

/**
 * Count occurrences of a keyword in HTML/text content (case-insensitive, whole words)
 */
export function countKeyword(text: string, keyword: string): number {
  if (!keyword || !text) return 0
  const clean = text.replace(/<[^>]*>/g, ' ').toLowerCase()
  const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b${escaped}\\b`, 'g')
  return (clean.match(regex) || []).length
}

/**
 * Extract plain text from HTML
 */
export function htmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  const clean = htmlToText(text)
  if (!clean) return 0
  return clean.split(/\s+/).filter(Boolean).length
}

/**
 * Extract headings from HTML
 */
function extractHeadings(html: string) {
  const h1 = (html.match(/<h1[^>]*>/gi) || []).length
  const h2 = (html.match(/<h2[^>]*>/gi) || []).length
  const h3 = (html.match(/<h3[^>]*>/gi) || []).length
  return { h1, h2, h3 }
}

/**
 * Check if keyword appears in a heading
 */
function keywordInHeadings(html: string, keyword: string): boolean {
  const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi
  const matches = html.match(headingRegex) || []
  return matches.some((h) => h.toLowerCase().includes(keyword.toLowerCase()))
}

/**
 * Calculate SEO score from content + metadata
 */
export function analyzeSeo(params: {
  html: string
  targetKeyword: string
  relatedKeywords: string[]
  metaTitle?: string
  metaDescription?: string
  targetWordCount?: number
}): SeoScore {
  const { html, targetKeyword, relatedKeywords, metaTitle, metaDescription, targetWordCount = 800 } = params

  const text = htmlToText(html)
  const wordCount = countWords(html)
  const headings = extractHeadings(html)

  // 1. Keyword density (30 pts)
  let keywordDensity = 0
  const keywordFrequency: Record<string, number> = {}
  if (targetKeyword) {
    const count = countKeyword(text, targetKeyword)
    keywordFrequency[targetKeyword] = count
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0
    // Ideal density 0.5%–2.5%
    if (density >= 0.5 && density <= 2.5) keywordDensity = 30
    else if (density > 0 && density < 0.5) keywordDensity = Math.round((density / 0.5) * 20)
    else if (density > 2.5 && density <= 4) keywordDensity = Math.round(30 - ((density - 2.5) / 1.5) * 15)
    else if (density > 4) keywordDensity = 5 // over-optimized penalty
  }

  // 2. Heading usage (20 pts)
  let headingUsage = 0
  if (headings.h1 === 1) headingUsage += 10 // exactly one H1
  if (headings.h2 >= 2) headingUsage += 5   // at least 2 H2s
  if (headings.h3 >= 1) headingUsage += 2
  if (targetKeyword && keywordInHeadings(html, targetKeyword)) headingUsage += 3

  // 3. Meta completeness (20 pts)
  let metaCompleteness = 0
  if (metaTitle) {
    metaCompleteness += 8
    if (targetKeyword && metaTitle.toLowerCase().includes(targetKeyword.toLowerCase())) metaCompleteness += 4
  }
  if (metaDescription) {
    metaCompleteness += 5
    if (metaDescription.length >= 120 && metaDescription.length <= 160) metaCompleteness += 3
  }

  // 4. Word count (15 pts)
  let wordCountScore = 0
  if (wordCount >= targetWordCount) wordCountScore = 15
  else if (wordCount > 0) wordCountScore = Math.round((wordCount / targetWordCount) * 15)

  // 5. Related terms (15 pts)
  let relatedTerms = 0
  if (relatedKeywords.length > 0) {
    let found = 0
    for (const kw of relatedKeywords) {
      const count = countKeyword(text, kw)
      keywordFrequency[kw] = count
      if (count > 0) found++
    }
    relatedTerms = Math.round((found / relatedKeywords.length) * 15)
  } else {
    relatedTerms = 15 // no related keywords = no penalty
  }

  const total = keywordDensity + headingUsage + metaCompleteness + wordCountScore + relatedTerms

  return {
    total: Math.min(total, 100),
    keywordDensity,
    headingUsage,
    metaCompleteness,
    wordCountScore,
    relatedTerms,
    details: {
      wordCount,
      targetWordCount,
      h1Count: headings.h1,
      h2Count: headings.h2,
      keywordFrequency,
    },
  }
}

/**
 * Score color based on value
 */
export function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}

export function scoreBg(score: number): string {
  if (score >= 70) return 'bg-green-50 border-green-200'
  if (score >= 40) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}
