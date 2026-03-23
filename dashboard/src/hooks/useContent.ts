import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '@/lib/supabase'
import type { ContentPiece } from '@/types'

export function useContent(clientId: string | undefined) {
  return useQuery({
    queryKey: ['content', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await contentApi.list(clientId!)
      if (error) throw error
      return data as ContentPiece[]
    },
  })
}

export function useContentPiece(id: string | undefined) {
  return useQuery({
    queryKey: ['content-piece', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await contentApi.get(id!)
      if (error) throw error
      return data as ContentPiece
    },
  })
}

export function useCreateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<ContentPiece, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await contentApi.create(data)
      if (error) throw error
      return result as ContentPiece
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['content', data.client_id] })
    },
  })
}

export function useUpdateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentPiece> }) => {
      const { data: result, error } = await contentApi.update(id, data)
      if (error) throw error
      return result as ContentPiece
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['content', data.client_id] })
      qc.invalidateQueries({ queryKey: ['content-piece', data.id] })
    },
  })
}

export function useDeleteContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await contentApi.delete(id)
      if (error) throw error
      return { clientId }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['content', data.clientId] })
    },
  })
}
