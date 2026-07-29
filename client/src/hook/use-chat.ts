import { useState, useEffect, useRef, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '#/lib/api'
import { authClient } from '#/lib/auth/auth-client'
import { getSocketUrl } from '#/lib/socket-url'
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

const SOCKET_URL = getSocketUrl()

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

  useEffect(() => {
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
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
      const currentConvId = activeConversationIdRef.current
      if (currentConvId) {
        socket.emit('join_conversation', { conversationId: currentConvId })
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    socket.on('disconnect', () => setIsConnected(false))
    socket.on('connect_error', () => setIsConnected(false))

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
                      lastActive:
                        lastActive ?? conv.otherParticipant.lastActive,
                    },
                  }
                : conv,
            ) ?? [],
        )
      },
    )

    socket.on('new_message', (msg: Message) => {
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
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      })
    })

    socket.on('message_edited', (msg: Message) => {
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
            conv.id === msg.conversationId && conv.lastMessage?.id === msg.id
              ? {
                  ...conv,
                  lastMessage: { ...conv.lastMessage, content: msg.content },
                }
              : conv,
          ) ?? [],
      )
    })

    socket.on(
      'message_deleted',
      (msg: {
        id: string
        conversationId: string
        isDeleted: boolean
        content: string
        attachments: string[]
        updatedAt: string
      }) => {
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
              conv.id === msg.conversationId && conv.lastMessage?.id === msg.id
                ? {
                    ...conv,
                    lastMessage: { ...conv.lastMessage, content: msg.content },
                  }
                : conv,
            ) ?? [],
        )
      },
    )

    socket.on(
      'messages_delivered',
      ({
        messageIds,
        deliveredAt,
      }: {
        messageIds: string[]
        deliveredAt: string
      }) => {
        setMessages((prev) =>
          prev.map((m) =>
            messageIds.includes(m.id) ? { ...m, deliveredAt } : m,
          ),
        )
        queryClient.setQueryData<Conversation[]>(
          ['conversations'],
          (old) =>
            old?.map((conv) =>
              conv.lastMessage && messageIds.includes(conv.lastMessage.id)
                ? { ...conv, lastMessage: { ...conv.lastMessage, deliveredAt } }
                : conv,
            ) ?? [],
        )
      },
    )

    socket.on('conversation_updated', () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    )

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

    socket.on('conversation_settings_updated', () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    )

    socket.on('conversation_blocked_updated', ({ id, blockedBy }: any) => {
      queryClient.setQueryData<Conversation[]>(
        ['conversations'],
        (old) =>
          old?.map((conv) =>
            conv.id === id ? { ...conv, blockedBy } : conv,
          ) ?? [],
      )
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    socket.on('chat_cleared', ({ conversationId }: any) => {
      if (conversationId === activeConversationIdRef.current) setMessages([])
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

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

    socket.on(
      'messages_read',
      ({
        conversationId,
        readAt,
      }: {
        conversationId: string
        readAt: string
      }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.conversationId === conversationId && m.senderId === userId
              ? {
                  ...m,
                  isRead: true,
                  readAt,
                  deliveredAt: m.deliveredAt || readAt,
                }
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
            ) ?? [],
        )
      },
    )

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, userId, queryClient])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      if (socketRef.current && !socketRef.current.connected && token)
        socketRef.current.connect()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [token, queryClient])

  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible')
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }, 30_000)
    return () => clearInterval(interval)
  }, [userId, queryClient])

  const switchConversation = useCallback(
    async (conversationId: string) => {
      if (activeConversationIdRef.current === conversationId) return

      setActiveConversationId(conversationId)
      activeConversationIdRef.current = conversationId
      setMessages([])
      setIsLoadingMessages(true)

      if (socketRef.current?.connected) {
        socketRef.current.emit('join_conversation', { conversationId })
      }

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

  const emitTyping = useCallback((isTyping: boolean) => {
    const convId = activeConversationIdRef.current
    if (!convId || !socketRef.current?.connected) return
    socketRef.current.emit('typing', { conversationId: convId, isTyping })
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
