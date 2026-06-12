import { useState, useEffect, useRef, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { authClient } from '#/lib/auth/auth-client'

import { getSocketUrl } from '#/lib/socket-url'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ChatUser {
  id: string
  name: string
  image: string | null
  role: string
  isOnline?: boolean
  lastActive?: string | null
  isGreenMember?: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  attachments: string[]
  isRead: boolean
  isEdited?: boolean
  isDeleted?: boolean
  deletedBy?: string[]
  deliveredAt?: string | null
  readAt?: string | null
  isForwarded?: boolean
  starredBy?: string[]
  pinnedBy?: string[]
  reactions?: { userId: string; name: string; emoji: string }[] | null
  createdAt: string
  updatedAt: string
  sender: Pick<ChatUser, 'id' | 'name' | 'image'>
}

export interface Conversation {
  id: string
  updatedAt: string
  otherParticipant: ChatUser
  unreadCount: number
  pinnedBy?: string[]
  mutedBy?: string[]
  disappearingDuration?: number
  lastMessage: {
    id: string
    content: string
    senderId: string
    isRead: boolean
    deliveredAt?: string | null
    readAt?: string | null
    createdAt: string
  } | null
}

// ─── Socket URL ───────────────────────────────────────────────────────────────
const SOCKET_URL = getSocketUrl()

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useChat() {
  const { data: session } = authClient.useSession()
  const userId = session?.user.id
  const token = session?.session.token
  const queryClient = useQueryClient()

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
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

  // Keep ref in sync with state so socket callbacks can read latest value
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  // ── Fetch Conversations list ─────────────────────────────────────────────
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
    // Re-fetch when window regains focus to recover from background tabs
    refetchOnWindowFocus: true,
  })

  // ── Mutation: start or get an existing 1-to-1 conversation ────────────────
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

  // ── Socket initialization ─────────────────────────────────────────────────
  useEffect(() => {
    // Wait until we have a valid auth token
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      // Start with polling (more reliable), upgrade to websocket if possible
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Socket.IO connected:', socket.id)

      // Re-join active conversation room after reconnect
      const currentConvId = activeConversationIdRef.current
      if (currentConvId) {
        socket.emit('join_conversation', { conversationId: currentConvId })
      }

      // Always refetch conversations after reconnect to pick up any missed messages
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    socket.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('⚠️ Socket.IO disconnected:', reason)
      // Socket.IO will auto-reconnect unless we called disconnect() manually
    })

    socket.on('connect_error', (err: Error) => {
      console.error('Socket connection error:', err.message)
      setIsConnected(false)
    })

    // Online/Offline presence updates
    socket.on(
      'user_status',
      ({
        userId: uid,
        status,
        lastActive,
      }: {
        userId: string
        status: 'online' | 'offline'
        lastActive?: string | null
      }) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev)
          if (status === 'online') updated.add(uid)
          else updated.delete(uid)
          return updated
        })

        queryClient.setQueryData<Conversation[]>(
          ['conversations'],
          (old) =>
            old?.map((conv) =>
              conv.otherParticipant.id === uid
                ? {
                    ...conv,
                    otherParticipant: {
                      ...conv.otherParticipant,
                      isOnline: status === 'online',
                      lastActive: lastActive !== undefined ? lastActive : conv.otherParticipant.lastActive,
                    },
                  }
                : conv,
            ) || [],
        )
      },
    )

    // Real-time new message from socket
    socket.on('new_message', (msg: Message) => {
      const currentConvId = activeConversationIdRef.current

      // Append to thread only if this is the open conversation
      setMessages((prev) => {
        if (msg.conversationId !== currentConvId) return prev
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })

      // Update conversations list sidebar
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
          }) || []

        // Keep sorted by most recent
        return [...updated].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      })
    })

    // Real-time message edit from socket
    socket.on('message_edited', (msg: Message) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, content: msg.content, isEdited: true, updatedAt: msg.updatedAt }
            : m,
        ),
      )
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) =>
        old?.map((conv) =>
          conv.id === msg.conversationId && conv.lastMessage?.id === msg.id
            ? {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  content: msg.content,
                },
              }
            : conv,
        ) || [],
      )
    })

    // Real-time message delete from socket
    socket.on('message_deleted', (msg: { id: string; conversationId: string; isDeleted: boolean; content: string; attachments: string[]; updatedAt: string }) => {
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
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) =>
        old?.map((conv) =>
          conv.id === msg.conversationId && conv.lastMessage?.id === msg.id
            ? {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  content: msg.content,
                },
              }
            : conv,
        ) || [],
      )
    })

    // Real-time message delivery from socket
    socket.on(
      'messages_delivered',
      ({ messageIds, deliveredAt }: { messageIds: string[]; deliveredAt: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            messageIds.includes(m.id)
              ? { ...m, deliveredAt }
              : m,
          ),
        )
        queryClient.setQueryData<Conversation[]>(['conversations'], (old) =>
          old?.map((conv) =>
            conv.lastMessage && messageIds.includes(conv.lastMessage.id)
              ? {
                  ...conv,
                  lastMessage: {
                    ...conv.lastMessage,
                    deliveredAt,
                  },
                }
              : conv,
          ) || [],
        )
      },
    )

    // Other user's notification — just refresh the list
    socket.on('conversation_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    // Starred, Pinned, Reactions, Settings and Clear events
    socket.on('message_starred_updated', ({ id, starredBy }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, starredBy } : m)),
      )
    })

    socket.on('message_pinned_updated', ({ id, pinnedBy }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, pinnedBy } : m)),
      )
    })

    socket.on('message_reactions_updated', ({ id, reactions }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, reactions } : m)),
      )
    })

    socket.on('conversation_settings_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    socket.on('chat_cleared', ({ conversationId }: any) => {
      const currentConvId = activeConversationIdRef.current
      if (conversationId === currentConvId) {
        setMessages([])
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    // Typing events
    socket.on(
      'typing',
      ({ conversationId, userId: typingUid, isTyping }: any) => {
        if (typingUid === userId) return
        setTypingUsers((prev) => {
          const updated = new Map(prev)
          if (isTyping) updated.set(conversationId, true)
          else updated.delete(conversationId)
          return updated
        })
      },
    )

    // Read receipts
    socket.on(
      'messages_read',
      ({ conversationId, readAt }: { conversationId: string; readAt: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.conversationId === conversationId && m.senderId === userId
              ? { ...m, isRead: true, readAt, deliveredAt: m.deliveredAt || readAt }
              : m,
          ),
        )
        queryClient.setQueryData<Conversation[]>(
          ['conversations'],
          (old) =>
            old?.map((conv) =>
              conv.id === conversationId && conv.lastMessage
                ? {
                    ...conv,
                    lastMessage: {
                      ...conv.lastMessage,
                      isRead: true,
                      readAt,
                      deliveredAt: conv.lastMessage.deliveredAt || readAt,
                    },
                  }
                : conv,
            ) || [],
        )
      },
    )

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token]) // Only re-run when token changes (login/logout)

  // ── Page visibility — reconnect when tab becomes active again ─────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh conversations in case we missed messages while hidden
        queryClient.invalidateQueries({ queryKey: ['conversations'] })

        // Reconnect socket if it dropped while hidden
        if (socketRef.current && !socketRef.current.connected && token) {
          socketRef.current.connect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [token, queryClient])

  // ── Online status polling — sync every 30s as fallback ───────────────────
  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }
    }, 30_000)
    return () => clearInterval(interval)
  }, [userId, queryClient])

  // ── Join & switch active conversation ─────────────────────────────────────
  const switchConversation = useCallback(
    async (conversationId: string) => {
      if (activeConversationIdRef.current === conversationId) return

      setActiveConversationId(conversationId)
      activeConversationIdRef.current = conversationId
      setMessages([])
      setIsLoadingMessages(true)

      // Join socket room
      if (socketRef.current?.connected) {
        socketRef.current.emit('join_conversation', { conversationId })
      }

      // Load message history via REST
      try {
        const res = await apiClient.get(
          `/chat/conversations/${conversationId}/messages`,
        )
        setMessages(res.data)
      } catch (err) {
        console.error('Failed to load messages:', err)
      } finally {
        setIsLoadingMessages(false)
      }

      // Clear unread badge immediately
      queryClient.setQueryData<Conversation[]>(
        ['conversations'],
        (old) =>
          old?.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          ) || [],
      )
    },
    [queryClient],
  )

  // ── Send a message ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback((content: string, attachments?: string[]) => {
    const convId = activeConversationIdRef.current
    if (!convId || !socketRef.current?.connected) return
    if (!content.trim() && (!attachments || attachments.length === 0)) return

    socketRef.current.emit('send_message', {
      conversationId: convId,
      content: content.trim(),
      attachments: attachments ?? [],
    })
  }, [])

  // ── Typing indicator emitter ───────────────────────────────────────────────
  const emitTyping = useCallback((isTyping: boolean) => {
    const convId = activeConversationIdRef.current
    if (!convId || !socketRef.current?.connected) return
    socketRef.current.emit('typing', { conversationId: convId, isTyping })
  }, [])

  // ── Typing state for current conversation ────────────────────────────────
  const isOtherPersonTyping = activeConversationId
    ? typingUsers.get(activeConversationId) === true
    : false

  // ── Open conversation with a target user ──────────────────────────────────
  const openConversationWith = useCallback(
    (targetUserId: string) => {
      openConversationMutation.mutate(targetUserId)
    },
    [openConversationMutation],
  )

  // ── Check if a user is online ─────────────────────────────────────────────
  const checkOnline = useCallback(
    (uid: string) => onlineUsers.has(uid),
    [onlineUsers],
  )

  // ── Edit message ───────────────────────────────────────────────────────────
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const res = await apiClient.put(`/chat/messages/${messageId}`, { content })
      return res.data as Message
    },
    onSuccess: (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
      )
    },
  })

  // ── Delete message ─────────────────────────────────────────────────────────
  const deleteMessageMutation = useMutation({
    mutationFn: async ({ messageId, mode }: { messageId: string; mode: 'me' | 'everyone' }) => {
      await apiClient.delete(`/chat/messages/${messageId}`, {
        params: { mode },
      })
      return { messageId, mode }
    },
    onSuccess: ({ messageId, mode }) => {
      if (mode === 'me') {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      }
    },
  })

  // ── Forward message ────────────────────────────────────────────────────────
  const forwardMessageMutation = useMutation({
    mutationFn: async ({ messageId, targetConversationIds }: { messageId: string; targetConversationIds: string[] }) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/forward`, {
        targetConversationIds,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // ── Star message ───────────────────────────────────────────────────────────
  const toggleStarMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/star`)
      return res.data as Message
    },
    onSuccess: (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      )
    },
  })

  // ── Pin message ────────────────────────────────────────────────────────────
  const togglePinMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/pin`)
      return res.data as Message
    },
    onSuccess: (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      )
    },
  })

  // ── React to message ───────────────────────────────────────────────────────
  const reactToMessageMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/react`, { emoji })
      return res.data as Message
    },
    onSuccess: (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      )
    },
  })

  // ── Remove message reaction ────────────────────────────────────────────────
  const removeReactionMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiClient.delete(`/chat/messages/${messageId}/react`)
      return res.data as Message
    },
    onSuccess: (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      )
    },
  })

  // ── Pin conversation ───────────────────────────────────────────────────────
  const togglePinConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/pin`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // ── Mute conversation ──────────────────────────────────────────────────────
  const toggleMuteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/mute`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // ── Clear conversation chat ────────────────────────────────────────────────
  const clearChatMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/clear`)
      return res.data
    },
    onSuccess: (_, conversationId) => {
      const currentConvId = activeConversationIdRef.current
      if (conversationId === currentConvId) {
        setMessages([])
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // ── Set disappearing messages duration ─────────────────────────────────────
  const setDisappearingMessagesMutation = useMutation({
    mutationFn: async ({ conversationId, duration }: { conversationId: string; duration: number }) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/disappearing`, { duration })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

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
    toggleStarMessage: toggleStarMessageMutation.mutateAsync,
    togglePinMessage: togglePinMessageMutation.mutateAsync,
    reactToMessage: reactToMessageMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
    togglePinConversation: togglePinConversationMutation.mutateAsync,
    toggleMuteConversation: toggleMuteConversationMutation.mutateAsync,
    clearChat: clearChatMutation.mutateAsync,
    setDisappearingMessages: setDisappearingMessagesMutation.mutateAsync,
  }
}

export const useCreateConversation = () => {
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

// Search users for new chat
export const useSearchChatUsers = (query: string, options?: { enabled?: boolean }) => {
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

// Delete a conversation
export const useDeleteConversation = () => {
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


