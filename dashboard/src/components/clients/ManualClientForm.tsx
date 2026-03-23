import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateClient } from '@/hooks/useClients'
import { slugify } from '@/lib/utils'

interface Props {
  onSuccess: () => void
}

export function ManualClientForm({ onSuccess }: Props) {
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [mainKeywords, setMainKeywords] = useState('')
  const [toneOfVoice, setToneOfVoice] = useState('')

  const { mutate: create, isPending, error } = useCreateClient()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    create(
      {
        name: name.trim(),
        slug: slugify(name),
        website_url: websiteUrl || undefined,
        main_keywords: mainKeywords
          ? mainKeywords.split(',').map((k) => k.trim()).filter(Boolean)
          : undefined,
        tone_of_voice: toneOfVoice || undefined,
      },
      { onSuccess }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#525252]">Client name *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Corp"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#525252]">Website URL</label>
        <Input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#525252]">Main keywords</label>
        <Input
          value={mainKeywords}
          onChange={(e) => setMainKeywords(e.target.value)}
          placeholder="keyword one, keyword two, keyword three"
        />
        <p className="text-[11px] text-[#a3a3a3]">Comma-separated</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#525252]">Tone of voice</label>
        <Textarea
          value={toneOfVoice}
          onChange={(e) => setToneOfVoice(e.target.value)}
          placeholder="Professional, conversational, direct..."
          rows={2}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">{(error as Error).message}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={isPending || !name.trim()}>
          {isPending ? 'Creating...' : 'Create client'}
        </Button>
      </div>
    </form>
  )
}
