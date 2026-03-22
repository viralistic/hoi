import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchNotionDatabase, mapNotionPageToClient, DEFAULT_FIELD_MAP } from '@/lib/notion'
import { useCreateClient } from '@/hooks/useClients'

interface Props {
  onSuccess: () => void
}

export function NotionImportForm({ onSuccess }: Props) {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('notion_api_key') || ''
  )
  const [databaseId, setDatabaseId] = useState('')
  const [pages, setPages] = useState<{ id: string; name: string }[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const { mutate: create, isPending } = useCreateClient()

  async function handleFetch() {
    if (!apiKey || !databaseId) return
    setFetchLoading(true)
    setFetchError('')
    try {
      localStorage.setItem('notion_api_key', apiKey)
      const results = await fetchNotionDatabase(apiKey, databaseId)
      setPages(
        results.map((p) => ({
          id: p.id,
          name: mapNotionPageToClient(p, DEFAULT_FIELD_MAP).name || p.id,
        }))
      )
    } catch (err) {
      setFetchError((err as Error).message)
    } finally {
      setFetchLoading(false)
    }
  }

  async function handleImport() {
    if (!apiKey || !databaseId) return
    const all = await fetchNotionDatabase(apiKey, databaseId)
    const toImport = all.filter((p) => selected.has(p.id))

    for (const page of toImport) {
      const client = mapNotionPageToClient(page, DEFAULT_FIELD_MAP)
      if (client.name) {
        await new Promise<void>((resolve, reject) =>
          create(
            {
              name: client.name!,
              slug: client.slug || client.name!.toLowerCase().replace(/\s+/g, '-'),
              ...client,
            },
            { onSuccess: () => resolve(), onError: reject }
          )
        )
      }
    }

    onSuccess()
  }

  function toggleAll() {
    if (selected.size === pages.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(pages.map((p) => p.id)))
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#525252]">Notion API key</label>
        <Input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="secret_..."
          type="password"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#525252]">Database ID</label>
        <Input
          value={databaseId}
          onChange={(e) => setDatabaseId(e.target.value)}
          placeholder="32-character database ID"
        />
        <p className="text-[11px] text-[#a3a3a3]">
          Found in the Notion database URL after the workspace name.
        </p>
      </div>

      {fetchError && <p className="text-xs text-red-500">{fetchError}</p>}

      {pages.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleFetch}
          disabled={fetchLoading || !apiKey || !databaseId}
        >
          {fetchLoading ? 'Fetching...' : 'Fetch clients from Notion'}
        </Button>
      ) : (
        <>
          <div className="flex flex-col gap-1 rounded-md border border-[#e5e5e5] p-2 max-h-48 overflow-y-auto">
            <label className="flex items-center gap-2 cursor-pointer px-1 pb-1 border-b border-[#f5f5f5]">
              <input
                type="checkbox"
                checked={selected.size === pages.length && pages.length > 0}
                onChange={toggleAll}
                className="accent-[#101010]"
              />
              <span className="text-xs font-medium text-[#525252]">
                Select all ({pages.length})
              </span>
            </label>
            {pages.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => {
                    const next = new Set(selected)
                    if (next.has(p.id)) next.delete(p.id)
                    else next.add(p.id)
                    setSelected(next)
                  }}
                  className="accent-[#101010]"
                />
                <span className="text-sm">{p.name}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setPages([])}
              className="text-xs text-[#a3a3a3] hover:text-[#737373]"
            >
              Reset
            </button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={isPending || selected.size === 0}
            >
              {isPending
                ? 'Importing...'
                : `Import ${selected.size} client${selected.size !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
