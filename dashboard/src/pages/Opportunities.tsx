import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Lightbulb, TrendingUp } from 'lucide-react'
import { opportunitiesApi } from '@/lib/supabase'
import { useClient } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { statusColor } from '@/lib/utils'
import type { ContentOpportunity } from '@/types'

export default function Opportunities() {
  const { clientId } = useParams<{ clientId: string }>()
  const { data: client } = useClient(clientId)
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await opportunitiesApi.list(clientId!)
      if (error) throw error
      return data as ContentOpportunity[]
    },
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentOpportunity['status'] }) => {
      const { error } = await opportunitiesApi.update(id, { status })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities', clientId] }),
  })

  const groups = {
    pending: opportunities.filter((o) => o.status === 'pending'),
    in_progress: opportunities.filter((o) => o.status === 'in_progress'),
    published: opportunities.filter((o) => o.status === 'published'),
    dismissed: opportunities.filter((o) => o.status === 'dismissed'),
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-[#0a0a0a]">Content Opportunities</h1>
          <p className="text-xs text-[#737373]">{client?.name}</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add opportunity
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#e5e5e5] py-16">
            <Lightbulb className="h-8 w-8 text-[#d4d4d4]" />
            <div className="text-center">
              <p className="text-sm font-medium text-[#525252]">No opportunities yet</p>
              <p className="text-xs text-[#a3a3a3]">Add content gaps or connect n8n to auto-generate them</p>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add manually
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(groups)
              .filter(([, items]) => items.length > 0)
              .map(([groupStatus, items]) => (
                <div key={groupStatus}>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(groupStatus)}`}
                    >
                      {groupStatus.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#a3a3a3]">{items.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        onStatusChange={(status) => updateStatus({ id: opp.id, status })}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <AddOpportunityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        clientId={clientId!}
      />
    </div>
  )
}

function OpportunityCard({
  opportunity: opp,
  onStatusChange,
}: {
  opportunity: ContentOpportunity
  onStatusChange: (status: ContentOpportunity['status']) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3">
      <Lightbulb className="h-4 w-4 flex-shrink-0 text-[#d4d4d4]" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0a0a0a] truncate">{opp.title}</p>
        {opp.target_keyword && (
          <p className="text-xs text-[#a3a3a3]">{opp.target_keyword}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {opp.opportunity_score != null && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-[#a3a3a3]" />
            <span className="text-xs text-[#737373]">{opp.opportunity_score}</span>
          </div>
        )}
        <select
          value={opp.status}
          onChange={(e) => onStatusChange(e.target.value as ContentOpportunity['status'])}
          className="rounded border border-[#e5e5e5] bg-white px-2 py-0.5 text-xs text-[#525252] outline-none"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="published">Published</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>
    </div>
  )
}

function AddOpportunityDialog({
  open,
  onOpenChange,
  clientId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  clientId: string
}) {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [keyword, setKeyword] = useState('')
  const [score, setScore] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await opportunitiesApi.create({
        client_id: clientId,
        title,
        target_keyword: keyword || undefined,
        opportunity_score: score ? parseInt(score) : undefined,
        status: 'pending',
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities', clientId] })
      onOpenChange(false)
      setTitle('')
      setKeyword('')
      setScore('')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add content opportunity</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); mutate() }}
          className="flex flex-col gap-3 pt-1"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#525252]">Title / content idea *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#525252]">Target keyword</label>
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#525252]">Opportunity score (0-100)</label>
            <Input value={score} onChange={(e) => setScore(e.target.value)} type="number" min="0" max="100" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPending || !title}>
              {isPending ? 'Adding...' : 'Add opportunity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
