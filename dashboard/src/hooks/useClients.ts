import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi } from '@/lib/supabase'
import type { Client } from '@/types'

export function useClients() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await clientsApi.list()
      if (error) throw error
      return data as Client[]
    },
  })

  return { clients: data || [], isLoading, error }
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['clients', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await clientsApi.get(id!)
      if (error) throw error
      return data as Client
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Client, 'id' | 'created_at'>) => {
      const { data: result, error } = await clientsApi.create(data)
      if (error) throw error
      return result as Client
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const { data: result, error } = await clientsApi.update(id, data)
      if (error) throw error
      return result as Client
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['clients', vars.id] })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await clientsApi.delete(id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}
