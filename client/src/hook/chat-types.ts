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
  archivedBy?: string[]
  blockedBy?: string[]
  reportedBy?: string[]
  isArchived?: boolean
  disappearingDuration?: number
  settings?: Record<string, { wallpaper?: string; theme?: string }>
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
