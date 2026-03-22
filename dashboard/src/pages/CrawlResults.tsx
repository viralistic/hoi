import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Globe, RefreshCw, ExternalLink, Trash2 } from 'lucide-react'
import { crawlApi } from '@/lib/supabase'
import { useClient } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { CrawledPage } from '@/types'

export default function CrawlResults() {
  const { clientId } = useParams<{ clientId: string }>()
  const { data: client } = useClient(clientId)
  const qc = useQueryClient()
  const [crawlUrl, setCrawlUrl] = useState(client?.website_url || '')
  const [crawling, setCrawling] = useState(false)
  const [crawlError, setCrawlError] = useState('')

  const { data: pages = [] } = useQuery({
    queryKey: ['crawled-pages', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await crawlApi.list(clientId!)
      if (error) throw error
      return data as CrawledPage[]
    },
  })

  const { mutate: deleteCrawl } = useMutation({
    mutationFn: async () => {
      const { error } = await crawlApi.deleteByClient(clientId!)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crawled-pages', clientId] }),
  })

  /**
   * Crawl a single URL via a CORS proxy or the n8n webhook.
   * In production, configure VITE_N8N_CRAWL_WEBHOOK and set up n8n to handle this.
   */
  async function handleCrawl() {
    if (!crawlUrl || !clientId) return
    setCrawling(true)
    setCrawlError('')

    const webhookUrl = import.meta.env.VITE_N8N_CRAWL_WEBHOOK

    if (webhookUrl) {
      // Trigger n8n crawl workflow
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: crawlUrl, client_id: clientId }),
        })
        if (!res.ok) throw new Error('Webhook failed')
        setCrawlError('')
        // n8n will push pages to Supabase; poll or refresh after a delay
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: ['crawled-pages', clientId] })
          setCrawling(false)
        }, 5000)
      } catch (err) {
        setCrawlError('Crawl webhook failed. Check your n8n setup.')
        setCrawling(false)
      }
    } else {
      // Fallback: save just the URL record without content
      try {
        await crawlApi.create({
          client_id: clientId,
          url: crawlUrl,
          title: new URL(crawlUrl).pathname || '/',
        })
        qc.invalidateQueries({ queryKey: ['crawled-pages', clientId] })
      } catch (err) {
        setCrawlError((err as Error).message)
      } finally {
        setCrawling(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-[#0a0a0a]">Website Crawl</h1>
          <p className="text-xs text-[#737373]">{client?.name}</p>
        </div>
        {pages.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => deleteCrawl()}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear results
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Crawl input */}
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-[#e5e5e5] bg-white p-4">
          <p className="text-sm font-medium text-[#0a0a0a]">Crawl a URL</p>
          <p className="text-xs text-[#737373]">
            Enter a URL to audit. For full-site crawling, configure the{' '}
            <code className="rounded bg-[#f5f5f5] px-1 py-0.5 text-[11px]">VITE_N8N_CRAWL_WEBHOOK</code> environment
            variable with your n8n webhook endpoint.
          </p>
          <div className="flex gap-2">
            <Input
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="flex-1"
            />
            <Button onClick={handleCrawl} disabled={crawling || !crawlUrl} size="sm">
              {crawling ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              {crawling ? 'Crawling...' : 'Crawl'}
            </Button>
          </div>
          {crawlError && <p className="text-xs text-red-500">{crawlError}</p>}
        </div>

        {/* Crawl results */}
        {pages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#e5e5e5] py-12">
            <Globe className="h-8 w-8 text-[#d4d4d4]" />
            <p className="text-sm text-[#a3a3a3]">No crawled pages yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#a3a3a3]">{pages.length} pages crawled</p>
            {pages.map((page) => (
              <CrawledPageRow key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CrawledPageRow({ page }: { page: CrawledPage }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3">
      <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#d4d4d4]" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#0a0a0a] truncate">
            {page.title || new URL(page.url).pathname}
          </p>
          {page.status_code && (
            <Badge
              variant={page.status_code < 300 ? 'success' : 'destructive'}
              className="text-[10px]"
            >
              {page.status_code}
            </Badge>
          )}
        </div>
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#a3a3a3] hover:text-[#737373] truncate"
        >
          {page.url}
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
        </a>
        {page.h1 && <p className="mt-1 text-xs text-[#525252]">H1: {page.h1}</p>}
        {page.meta_description && (
          <p className="mt-0.5 text-xs text-[#737373] line-clamp-2">{page.meta_description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-3">
          {page.word_count != null && (
            <span className="text-[11px] text-[#a3a3a3]">{page.word_count} words</span>
          )}
          <span className="text-[11px] text-[#a3a3a3]">{formatDate(page.crawled_at)}</span>
        </div>
      </div>
    </div>
  )
}
