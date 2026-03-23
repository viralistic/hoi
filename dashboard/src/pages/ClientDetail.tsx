import { useParams, Link, useNavigate } from 'react-router-dom'
import { Plus, ExternalLink, FileText, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useClient, useDeleteClient } from '@/hooks/useClients'
import { useContent, useDeleteContent } from '@/hooks/useContent'
import { formatDate, statusColor, contentTypeIcon } from '@/lib/utils'
import { useCreateContent } from '@/hooks/useContent'
import type { ContentPiece } from '@/types'

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useClient(clientId)
  const { data: content = [], isLoading: contentLoading } = useContent(clientId)
  const { mutate: createContent } = useCreateContent()
  const { mutate: deleteContent } = useDeleteContent()
  const { mutate: deleteClient } = useDeleteClient()

  async function handleNewContent() {
    if (!clientId || !client) return
    createContent(
      {
        client_id: clientId,
        title: 'Untitled',
        status: 'draft',
        content_type: 'blog',
      },
      {
        onSuccess: (piece) => navigate(`/clients/${clientId}/content/${piece.id}`),
      }
    )
  }

  function handleDeleteClient() {
    if (!clientId) return
    if (!confirm(`Delete ${client?.name}? This will remove all their content.`)) return
    deleteClient(clientId, {
      onSuccess: () => navigate('/'),
    })
  }

  if (isLoading) return <LoadingState />
  if (!client) return <div className="p-6 text-sm text-[#737373]">Client not found</div>

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f5f5f5] text-base font-semibold uppercase">
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#0a0a0a]">{client.name}</h1>
            {client.website_url && (
              <a
                href={client.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#a3a3a3] hover:text-[#737373]"
              >
                {client.website_url.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleDeleteClient} title="Delete client">
            <Trash2 className="h-4 w-4 text-[#a3a3a3]" />
          </Button>
          <Button size="sm" onClick={handleNewContent}>
            <Plus className="h-3.5 w-3.5" />
            New content
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="brandscript">Brand script</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
          </TabsList>

          {/* Content list */}
          <TabsContent value="content">
            {contentLoading ? (
              <div className="text-sm text-[#a3a3a3] py-4">Loading...</div>
            ) : content.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#e5e5e5] py-12 mt-4">
                <FileText className="h-8 w-8 text-[#d4d4d4]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[#525252]">No content yet</p>
                  <p className="text-xs text-[#a3a3a3]">Create your first piece of content</p>
                </div>
                <Button size="sm" onClick={handleNewContent}>
                  <Plus className="h-3.5 w-3.5" />
                  New content
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {content.map((piece) => (
                  <ContentRow
                    key={piece.id}
                    piece={piece}
                    clientId={clientId!}
                    onDelete={() =>
                      deleteContent({ id: piece.id, clientId: clientId! })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Brand script */}
          <TabsContent value="brandscript">
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {client.brand_script ? (
                Object.entries(client.brand_script)
                  .filter(([, v]) => v)
                  .map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="mt-1 text-sm text-[#0a0a0a]">{value as string}</p>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <p className="text-sm text-[#a3a3a3]">No StoryBrand data. Import from Notion or add manually.</p>
              )}
            </div>
          </TabsContent>

          {/* Keywords */}
          <TabsContent value="keywords">
            <div className="mt-4 flex flex-col gap-4">
              {client.main_keywords && client.main_keywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a3a3a3] mb-2">Main keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.main_keywords.map((kw) => (
                      <Badge key={kw} variant="outline">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {client.extra_keywords && client.extra_keywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a3a3a3] mb-2">Extra keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.extra_keywords.map((kw) => (
                      <Badge key={kw} variant="secondary">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {!client.main_keywords?.length && !client.extra_keywords?.length && (
                <p className="text-sm text-[#a3a3a3]">No keywords set.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ContentRow({
  piece,
  clientId,
  onDelete,
}: {
  piece: ContentPiece
  clientId: string
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 transition-colors hover:border-[#d4d4d4]">
      <span className="text-base">{contentTypeIcon(piece.content_type)}</span>
      <div className="flex-1 min-w-0">
        <Link
          to={`/clients/${clientId}/content/${piece.id}`}
          className="text-sm font-medium text-[#0a0a0a] hover:underline truncate block"
        >
          {piece.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-[#a3a3a3]">{formatDate(piece.updated_at)}</span>
          {piece.target_keyword && (
            <span className="text-[11px] text-[#a3a3a3]">· {piece.target_keyword}</span>
          )}
          {piece.word_count != null && (
            <span className="text-[11px] text-[#a3a3a3]">· {piece.word_count}w</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {piece.seo_score != null && (
          <span
            className={`text-xs font-semibold ${
              piece.seo_score >= 70
                ? 'text-green-600'
                : piece.seo_score >= 40
                ? 'text-amber-500'
                : 'text-red-500'
            }`}
          >
            {piece.seo_score}
          </span>
        )}
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(piece.status)}`}>
          {piece.status}
        </span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#a3a3a3] hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-[#f5f5f5] animate-pulse" />
      ))}
    </div>
  )
}
