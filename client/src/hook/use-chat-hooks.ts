import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await apiClient.post('/chat/conversations', { targetUserId })
      return res.data
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.delete(`/chat/conversations/${conversationId}`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  })
}

export function useSearchChatUsers(
  query: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['chat-users-search', query],
    queryFn: async () => {
      const res = await apiClient.get('/chat/users/search', {
        params: { q: query || undefined },
      })
      return res.data as any[]
    },
    ...options,
  })
}

export function useConversations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.get('/chat/conversations')
      const data = res.data
      return (Array.isArray(data) ? data : data?.conversations || []) as any[]
    },
    staleTime: 10_000,
    ...options,
  })
}
