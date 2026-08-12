import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { authClient } from '#/lib/auth/auth-client'
import { supabase } from '#/lib/supabase'
import type { Message, Conversation } from './chat-types'
import {
  useEditMessage,
  useDeleteMessage,
  useForwardMessage,
  useToggleStarMessage,
  useTogglePinMessage,
  useReactToMessage,
  useRemoveReaction,
  useTogglePinConversation,
  useToggleMuteConversation,
  useClearChat,
  useSetDisappearingMessages,
  useArchiveConversation,
  useUnarchiveConversation,
  useUpdateConversationSettings,
  useBlockConversation,
  useUnblockConversation,
  useReportConversation,
} from './use-chat-mutations'

export function useChat() {
  const { data: session } = authClient.useSession()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  const [isConnected, setIsConnected] = useState(true)
  const activeConversationIdRef = useRef<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(
    new Map(),
  )
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.get('/chat/conversations')
      return res.data
    },
    enabled: !!userId,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })

  const openConversationMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await apiClient.post('/chat/conversations', { targetUserId })
      return res.data as Conversation
    },
    onSuccess: async (conv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      await switchConversation(conv.id)
    },
  })

  // ─── Realtime Presence Channel ─────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const presenceChannel = supabase.channel('online-presence', {
      config: { presence: { key: userId } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const onlineSet = new Set<string>()
        Object.keys(state).forEach((key) => {
          onlineSet.add(key)
        })
        setOnlineUsers(onlineSet)
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => new Set(prev).add(key))
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      })
      .on(
        'broadcast',
        { event: 'user_status' },
        ({
          payload,
        }: {
          payload: { userId: string; status: 'online' | 'offline' }
        }) => {
          setOnlineUsers((prev) => {
            const next = new Set(prev)
            if (payload.status === 'online') next.add(payload.userId)
            else next.delete(payload.userId)
            return next
          })
        },
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      presenceChannel.unsubscribe()
    }
  }, [userId])

  // ─── User Personal Channel ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const userChannel = supabase
      .channel(`user_${userId}`)
      .on('broadcast', { event: 'conversation_updated' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      })
      .on('broadcast', { event: 'conversation_settings_updated' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      })
      .on('broadcast', { event: 'chat_cleared' }, ({ payload }) => {
        if (payload?.conversationId === activeConversationIdRef.current) {
          setMessages([])
        }
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      })
      .subscribe()

    return () => {
      userChannel.unsubscribe()
    }
  }, [userId, queryClient])

  // ─── Active Conversation Room Channel ──────────────────────────────────────
  useEffect(() => {
    if (!activeConversationId) return

    const convChannel = supabase
      .channel(`conversation_${activeConversationId}`)
      .on(
        'broadcast',
        { event: 'new_message' },
        ({ payload: msg }: { payload: Message }) => {
          const currentConvId = activeConversationIdRef.current
          setMessages((prev) => {
            if (msg.conversationId !== currentConvId) return prev
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
            const updated =
              old?.map((conv) => {
                if (conv.id !== msg.conversationId) return conv
                const isActiveConv = msg.conversationId === currentConvId
                return {
                  ...conv,
                  updatedAt: msg.createdAt,
                  lastMessage: {
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.senderId,
                    isRead: msg.isRead,
                    deliveredAt: msg.deliveredAt,
                    readAt: msg.readAt,
                    createdAt: msg.createdAt,
                  },
                  unreadCount: isActiveConv
                    ? 0
                    : conv.unreadCount + (msg.senderId !== userId ? 1 : 0),
                }
              }) ?? []
            return [...updated].sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )
          })
        },
      )
      .on(
        'broadcast',
        { event: 'message_edited' },
        ({ payload: msg }: { payload: Message }) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? {
                    ...m,
                    content: msg.content,
                    isEdited: true,
                    updatedAt: msg.updatedAt,
                  }
                : m,
            ),
          )
          queryClient.setQueryData<Conversation[]>(
            ['conversations'],
            (old) =>
              old?.map((conv) =>
                conv.id === msg.conversationId &&
                conv.lastMessage &&
                conv.lastMessage.id === msg.id
                  ? {
                      ...conv,
                      lastMessage: {
                        ...conv.lastMessage,
                        content: msg.content,
                      },
                    }
                  : conv,
              ) ?? [],
          )
        },
      )
      .on(
        'broadcast',
        { event: 'message_deleted' },
        ({ payload: msg }: { payload: any }) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? {
                    ...m,
                    content: msg.content,
                    attachments: msg.attachments,
                    isDeleted: msg.isDeleted,
                    updatedAt: msg.updatedAt,
                  }
                : m,
            ),
          )
          queryClient.setQueryData<Conversation[]>(
            ['conversations'],
            (old) =>
              old?.map((conv) =>
                conv.id === msg.conversationId &&
                conv.lastMessage &&
                conv.lastMessage.id === msg.id
                  ? {
                      ...conv,
                      lastMessage: {
                        ...conv.lastMessage,
                        content: msg.content,
                      },
                    }
                  : conv,
              ) ?? [],
          )
        },
      )
      .on(
        'broadcast',
        { event: 'messages_delivered' },
        ({ payload }: { payload: any }) => {
          const { messageIds, deliveredAt } = payload || {}
          if (!Array.isArray(messageIds)) return
          setMessages((prev) =>
            prev.map((m) =>
              messageIds.includes(m.id) ? { ...m, deliveredAt } : m,
            ),
          )
        },
      )
      .on(
        'broadcast',
        { event: 'messages_read' },
        ({ payload }: { payload: any }) => {
          const { conversationId: convId, readAt } = payload || {}
          setMessages((prev) =>
            prev.map((m) =>
              m.conversationId === convId && m.senderId === userId
                ? {
                    ...m,
                    isRead: true,
                    readAt,
                    deliveredAt: m.deliveredAt || readAt,
                  }
                : m,
            ),
          )
        },
      )
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
        const {
          conversationId: convId,
          userId: typingUid,
          isTyping,
        } = payload || {}
        if (typingUid === userId) return
        setTypingUsers((prev) => {
          const updated = new Map(prev)
          if (isTyping) updated.set(convId, true)
          else updated.delete(convId)
          return updated
        })
      })
      .on(
        'broadcast',
        { event: 'message_starred_updated' },
        ({ payload }: { payload: any }) => {
          const { id, starredBy } = payload || {}
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, starredBy } : m)),
          )
        },
      )
      .on(
        'broadcast',
        { event: 'message_pinned_updated' },
        ({ payload }: { payload: any }) => {
          const { id, pinnedBy } = payload || {}
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, pinnedBy } : m)),
          )
        },
      )
      .on(
        'broadcast',
        { event: 'message_reactions_updated' },
        ({ payload }: { payload: any }) => {
          const { id, reactions } = payload || {}
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, reactions } : m)),
          )
        },
      )
      .on('broadcast', { event: 'conversation_settings_updated' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      })
      .on(
        'broadcast',
        { event: 'conversation_blocked_updated' },
        ({ payload }: { payload: any }) => {
          const { id, blockedBy } = payload || {}
          queryClient.setQueryData<Conversation[]>(
            ['conversations'],
            (old) =>
              old?.map((conv) =>
                conv.id === id ? { ...conv, blockedBy } : conv,
              ) ?? [],
          )
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
      )
      .subscribe()

    return () => {
      convChannel.unsubscribe()
    }
  }, [activeConversationId, userId, queryClient])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [queryClient])

  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible')
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }, 30_000)
    return () => clearInterval(interval)
  }, [userId, queryClient])

  const switchConversation = useCallback(
    async (conversationId: string | null) => {
      if (activeConversationIdRef.current === conversationId) return

      setActiveConversationId(conversationId)
      activeConversationIdRef.current = conversationId
      setMessages([])

      if (!conversationId) {
        setIsLoadingMessages(false)
        return
      }

      setIsLoadingMessages(true)

      try {
        const res = await apiClient.get(
          `/chat/conversations/${conversationId}/messages`,
        )
        setMessages(res.data)

        // Mark unread messages as read
        await apiClient.post(`/chat/conversations/${conversationId}/read`)
      } catch (err) {
        console.error('Failed to load messages:', err)
      } finally {
        setIsLoadingMessages(false)
      }

      queryClient.setQueryData<Conversation[]>(
        ['conversations'],
        (old) =>
          old?.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          ) ?? [],
      )
    },
    [queryClient],
  )

  const sendMessage = useCallback(
    async (content: string, attachments?: string[]) => {
      const convId = activeConversationIdRef.current
      if (!convId) return
      if (!content.trim() && (!attachments || attachments.length === 0)) return

      try {
        const res = await apiClient.post(
          `/chat/conversations/${convId}/messages`,
          {
            content: content.trim(),
            attachments: attachments ?? [],
          },
        )
        const newMsg = res.data as Message
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      } catch (err) {
        console.error('Failed to send message:', err)
      }
    },
    [],
  )

  const emitTyping = useCallback(async (isTyping: boolean) => {
    const convId = activeConversationIdRef.current
    if (!convId) return
    try {
      await apiClient.post(`/chat/conversations/${convId}/typing`, { isTyping })
    } catch {
      // Ignore typing indicator errors silently
    }
  }, [])

  const isOtherPersonTyping = activeConversationId
    ? typingUsers.get(activeConversationId) === true
    : false

  const openConversationWith = useCallback(
    (targetUserId: string) => {
      openConversationMutation.mutate(targetUserId)
    },
    [openConversationMutation],
  )

  const checkOnline = useCallback(
    (uid: string) => onlineUsers.has(uid),
    [onlineUsers],
  )

  const editMessageMutation = useEditMessage()
  const deleteMessageMutation = useDeleteMessage()
  const forwardMessageMutation = useForwardMessage()
  const togglePinConversationMutation = useTogglePinConversation()
  const toggleMuteConversationMutation = useToggleMuteConversation()
  const clearChatMutation = useClearChat()
  const setDisappearingMessagesMutation = useSetDisappearingMessages()
  const toggleStarMessageMutation = useToggleStarMessage()
  const togglePinMessageMutation = useTogglePinMessage()
  const reactToMessageMutation = useReactToMessage()
  const removeReactionMutation = useRemoveReaction()
  const archiveConversationMutation = useArchiveConversation()
  const unarchiveConversationMutation = useUnarchiveConversation()
  const updateConversationSettingsMutation = useUpdateConversationSettings()
  const blockConversationMutation = useBlockConversation()
  const unblockConversationMutation = useUnblockConversation()
  const reportConversationMutation = useReportConversation()

  return {
    isConnected,
    conversations,
    isLoadingConversations,
    refetchConversations,
    activeConversationId,
    switchConversation,
    openConversationWith,
    messages,
    isLoadingMessages,
    sendMessage,
    emitTyping,
    isOtherPersonTyping,
    onlineUsers,
    checkOnline,
    currentUserId: userId,
    session,
    editMessage: editMessageMutation.mutateAsync,
    deleteMessage: deleteMessageMutation.mutateAsync,
    forwardMessage: forwardMessageMutation.mutateAsync,
    togglePinConversation: togglePinConversationMutation.mutateAsync,
    toggleMuteConversation: toggleMuteConversationMutation.mutateAsync,
    clearChat: clearChatMutation.mutateAsync,
    setDisappearingMessages: ({
      conversationId,
      duration,
    }: {
      conversationId: string
      duration: number
    }) =>
      setDisappearingMessagesMutation.mutateAsync({ conversationId, duration }),
    toggleStarMessage: toggleStarMessageMutation.mutateAsync,
    togglePinMessage: togglePinMessageMutation.mutateAsync,
    reactToMessage: reactToMessageMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
    archiveConversation: archiveConversationMutation.mutateAsync,
    unarchiveConversation: unarchiveConversationMutation.mutateAsync,
    updateConversationSettings: updateConversationSettingsMutation.mutateAsync,
    blockConversation: blockConversationMutation.mutateAsync,
    unblockConversation: unblockConversationMutation.mutateAsync,
    reportConversation: reportConversationMutation.mutateAsync,
  }
}

export type { Message, Conversation, ChatUser } from './chat-types'
export {
  useCreateConversation,
  useDeleteConversation,
  useSearchChatUsers,
  useConversations,
} from './use-chat-hooks'
export {
  useToggleStarMessage,
  useTogglePinMessage,
  useReactToMessage,
  useRemoveReaction,
} from './use-chat-mutations'
export {
  useEditMessage,
  useDeleteMessage,
  useForwardMessage,
} from './use-chat-mutations'
export {
  useTogglePinConversation,
  useToggleMuteConversation,
  useClearChat,
  useSetDisappearingMessages,
} from './use-chat-mutations'
export {
  useArchiveConversation,
  useUnarchiveConversation,
  useUpdateConversationSettings,
} from './use-chat-mutations'
export {
  useBlockConversation,
  useUnblockConversation,
  useReportConversation,
} from './use-chat-mutations'
