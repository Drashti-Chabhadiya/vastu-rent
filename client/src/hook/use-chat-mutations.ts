import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import type { Message } from './chat-types'

export function useEditMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      messageId,
      content,
    }: {
      messageId: string
      content: string
    }) => {
      const res = await apiClient.put(`/chat/messages/${messageId}`, {
        content,
      })
      return res.data as Message
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useDeleteMessage() {
  return useMutation({
    mutationFn: async ({
      messageId,
      mode,
    }: {
      messageId: string
      mode: 'me' | 'everyone'
    }) => {
      await apiClient.delete(`/chat/messages/${messageId}`, {
        params: { mode },
      })
    },
  })
}

export function useForwardMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      messageId,
      targetConversationIds,
    }: {
      messageId: string
      targetConversationIds: string[]
    }) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/forward`, {
        targetConversationIds,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useToggleStarMessage() {
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/star`)
      return res.data as Message
    },
  })
}

export function useTogglePinMessage() {
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/pin`)
      return res.data as Message
    },
  })
}

export function useReactToMessage() {
  return useMutation({
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string
      emoji: string
    }) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/react`, {
        emoji,
      })
      return res.data as Message
    },
  })
}

export function useRemoveReaction() {
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiClient.delete(`/chat/messages/${messageId}/react`)
      return res.data as Message
    },
  })
}

export function useTogglePinConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/pin`,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useToggleMuteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/mute`,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useClearChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/clear`,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useSetDisappearingMessages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      duration,
    }: {
      conversationId: string
      duration: number
    }) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/disappearing`,
        { duration },
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useArchiveConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/archive`,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUnarchiveConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/unarchive`,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUpdateConversationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      settings,
    }: {
      conversationId: string
      settings: { wallpaper?: string; theme?: string }
    }) => {
      const res = await apiClient.patch(
        `/chat/conversations/${conversationId}/settings`,
        settings,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useBlockConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/block`,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUnblockConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/unblock`,
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useReportConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      reason,
    }: {
      conversationId: string
      reason: string
    }) => {
      const res = await apiClient.post(
        `/chat/conversations/${conversationId}/report`,
        { reason },
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await apiClient.post('/chat/conversations', { targetUserId })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.delete(`/chat/conversations/${conversationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useOpenConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await apiClient.post('/chat/conversations', { targetUserId })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
