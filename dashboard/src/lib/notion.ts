import type { Client, BrandScript, Segment } from '@/types'

interface NotionProperty {
  type: string
  title?: Array<{ plain_text: string }>
  rich_text?: Array<{ plain_text: string }>
  url?: string
  multi_select?: Array<{ name: string }>
  select?: { name: string }
}

interface NotionPage {
  id: string
  properties: Record<string, NotionProperty>
}

/**
 * Fetch pages from a Notion database via the Notion API.
 * Requires VITE_NOTION_API_KEY and a databaseId.
 * Note: direct browser calls are blocked by CORS — use this via a Supabase Edge Function or n8n proxy.
 */
export async function fetchNotionDatabase(
  apiKey: string,
  databaseId: string
): Promise<NotionPage[]> {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to fetch Notion database')
  }

  const data = await res.json()
  return data.results as NotionPage[]
}

/**
 * Get plain text from a Notion property
 */
function getText(prop: NotionProperty | undefined): string {
  if (!prop) return ''
  if (prop.type === 'title' && prop.title) return prop.title.map((t) => t.plain_text).join('')
  if (prop.type === 'rich_text' && prop.rich_text) return prop.rich_text.map((t) => t.plain_text).join('')
  if (prop.type === 'url') return prop.url || ''
  if (prop.type === 'select') return prop.select?.name || ''
  return ''
}

function getMultiSelect(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== 'multi_select' || !prop.multi_select) return []
  return prop.multi_select.map((s) => s.name)
}

/**
 * Map a Notion page to a Client record using field mapping config.
 * fieldMap: { clientField -> notionPropertyName }
 */
export function mapNotionPageToClient(
  page: NotionPage,
  fieldMap: Record<string, string>
): Partial<Client> {
  const props = page.properties

  const name = getText(props[fieldMap.name])
  const websiteUrl = getText(props[fieldMap.website_url])
  const toneOfVoice = getText(props[fieldMap.tone_of_voice])
  const mainKeywords = getMultiSelect(props[fieldMap.main_keywords])
  const extraKeywords = getMultiSelect(props[fieldMap.extra_keywords])

  // BrandScript fields
  const brandScript: BrandScript = {
    character: getText(props[fieldMap.brand_character]),
    problem_external: getText(props[fieldMap.brand_problem_external]),
    problem_internal: getText(props[fieldMap.brand_problem_internal]),
    problem_philosophical: getText(props[fieldMap.brand_problem_philosophical]),
    guide: getText(props[fieldMap.brand_guide]),
    plan: getText(props[fieldMap.brand_plan]),
    cta: getText(props[fieldMap.brand_cta]),
    failure: getText(props[fieldMap.brand_failure]),
    success: getText(props[fieldMap.brand_success]),
  }

  // Segments
  const segmentNames = getMultiSelect(props[fieldMap.segments])
  const segments: Segment[] = segmentNames.map((s) => ({ name: s }))

  return {
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    website_url: websiteUrl || undefined,
    notion_id: page.id,
    brand_script: brandScript,
    tone_of_voice: toneOfVoice || undefined,
    segments: segments.length ? segments : undefined,
    main_keywords: mainKeywords.length ? mainKeywords : undefined,
    extra_keywords: extraKeywords.length ? extraKeywords : undefined,
  }
}

/**
 * Default field mapping — maps client fields to common Notion property names.
 * Users can customize this in Settings.
 */
export const DEFAULT_FIELD_MAP: Record<string, string> = {
  name: 'Name',
  website_url: 'Website',
  tone_of_voice: 'Tone of Voice',
  main_keywords: 'Main Keywords',
  extra_keywords: 'Extra Keywords',
  segments: 'Segments',
  brand_character: 'Brand - Character',
  brand_problem_external: 'Brand - External Problem',
  brand_problem_internal: 'Brand - Internal Problem',
  brand_problem_philosophical: 'Brand - Philosophical Problem',
  brand_guide: 'Brand - Guide',
  brand_plan: 'Brand - Plan',
  brand_cta: 'Brand - CTA',
  brand_failure: 'Brand - Failure',
  brand_success: 'Brand - Success',
}
