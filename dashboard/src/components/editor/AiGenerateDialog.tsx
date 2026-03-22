import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, StopCircle } from 'lucide-react'
import type { Client } from '@/types'

const STORYBRAND_SECTIONS = [
  { value: 'full_blog', label: 'Full blog post' },
  { value: 'hero', label: 'Hero / intro section' },
  { value: 'problem', label: 'Problem section' },
  { value: 'guide', label: 'Guide / solution section' },
  { value: 'plan', label: 'Step-by-step plan' },
  { value: 'cta', label: 'Call to action' },
  { value: 'success', label: 'Success / transformation' },
  { value: 'faq', label: 'FAQ section' },
  { value: 'meta', label: 'Meta title + description' },
]

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog post' },
  { value: 'page', label: 'Web page' },
  { value: 'landing', label: 'Landing page' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social post' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  targetKeyword: string
  onInsert: (text: string) => void
}

export function AiGenerateDialog({ open, onOpenChange, client, targetKeyword, onInsert }: Props) {
  const [section, setSection] = useState('full_blog')
  const [contentType, setContentType] = useState('blog')
  const [keyword, setKeyword] = useState(targetKeyword)
  const [extraInstructions, setExtraInstructions] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  function buildSystemPrompt(): string {
    const bs = client?.brand_script
    const parts: string[] = [
      'You are an expert content writer specializing in StoryBrand framework and SEO-optimized content.',
      '',
      'WRITING RULES:',
      '- Write in clear, compelling, customer-centric language',
      '- Position the customer as the hero, the brand as the guide',
      '- Address external, internal, and philosophical problems where relevant',
      '- Use the target keyword naturally — aim for 1-2% density without over-stuffing',
      '- Use proper HTML heading tags (h1, h2, h3) for structure',
      '- Write paragraphs in <p> tags',
      '- Use <ul>/<li> for lists',
      '- Output only the content HTML, no markdown, no explanations',
    ]

    if (client) {
      parts.push('', `CLIENT: ${client.name}`)
      if (client.website_url) parts.push(`WEBSITE: ${client.website_url}`)
      if (client.tone_of_voice) parts.push(`TONE: ${client.tone_of_voice}`)
      if (client.main_keywords?.length) parts.push(`MAIN KEYWORDS: ${client.main_keywords.join(', ')}`)
    }

    if (bs) {
      parts.push('', 'STORYBRAND CONTEXT:')
      if (bs.character) parts.push(`- Customer/Hero: ${bs.character}`)
      if (bs.problem_external) parts.push(`- External problem: ${bs.problem_external}`)
      if (bs.problem_internal) parts.push(`- Internal problem: ${bs.problem_internal}`)
      if (bs.guide) parts.push(`- Brand as guide: ${bs.guide}`)
      if (bs.plan) parts.push(`- The plan: ${bs.plan}`)
      if (bs.cta) parts.push(`- CTA: ${bs.cta}`)
      if (bs.success) parts.push(`- Success/transformation: ${bs.success}`)
    }

    return parts.join('\n')
  }

  function buildUserPrompt(): string {
    const sectionLabel = STORYBRAND_SECTIONS.find((s) => s.value === section)?.label
    const typeLabel = CONTENT_TYPES.find((t) => t.value === contentType)?.label

    const parts = [
      `Write a ${sectionLabel} for a ${typeLabel}.`,
      keyword ? `Target keyword: "${keyword}"` : '',
      extraInstructions ? `Additional instructions: ${extraInstructions}` : '',
      '',
      'Output clean HTML only.',
    ].filter(Boolean)

    return parts.join('\n')
  }

  async function handleGenerate() {
    setOutput('')
    setLoading(true)
    abortRef.current = new AbortController()

    try {
      const apiKey = localStorage.getItem('anthropic_api_key')
      if (!apiKey) {
        setOutput('<p>No Anthropic API key found. Add it in Settings.</p>')
        setLoading(false)
        return
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          stream: true,
          system: buildSystemPrompt(),
          messages: [{ role: 'user', content: buildUserPrompt() }],
        }),
      })

      if (!response.ok || !response.body) {
        const err = await response.json()
        setOutput(`<p>Error: ${err.error?.message || 'Unknown error'}</p>`)
        setLoading(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6)
            if (raw === '[DONE]') continue
            try {
              const parsed = JSON.parse(raw)
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                accumulated += parsed.delta.text
                setOutput(accumulated)
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setOutput(`<p>Error: ${(err as Error).message}</p>`)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleStop() {
    abortRef.current?.abort()
    setLoading(false)
  }

  function handleInsert() {
    onInsert(output)
    onOpenChange(false)
    setOutput('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#525252]">Section type</label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORYBRAND_SECTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#525252]">Content type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#525252]">Target keyword</label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="main keyword to optimize for"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#525252]">
              Extra instructions <span className="text-[#a3a3a3]">(optional)</span>
            </label>
            <Textarea
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="Mention competitor X, include stat about Y, focus on Z audience..."
              rows={2}
            />
          </div>

          {/* Output preview */}
          {(output || loading) && (
            <div className="rounded-md border border-[#e5e5e5] bg-[#fafafa] p-3 max-h-64 overflow-y-auto">
              {output ? (
                <div
                  className="prose prose-sm max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Generating...
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between gap-2 pt-1">
            <div className="flex gap-2">
              {loading ? (
                <Button variant="outline" size="sm" onClick={handleStop}>
                  <StopCircle className="h-3.5 w-3.5 mr-1" />
                  Stop
                </Button>
              ) : (
                <Button size="sm" onClick={handleGenerate}>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Generate
                </Button>
              )}
            </div>
            {output && !loading && (
              <Button size="sm" onClick={handleInsert}>
                Insert into editor
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
