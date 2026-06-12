import { create } from 'zustand'
import type { Conversation, Message } from '#/hook'

export interface ReplyTarget {
  id: string
  content: string
  senderName: string
  isMe: boolean
}

export interface ChatStoreState {
  searchQuery: string
  activeSubTab: 'all' | 'unread' | 'bookings' | 'support'
  inputText: string
  showEmojiPicker: boolean
  showMobileChat: boolean
  replyTarget: ReplyTarget | null
  hoveredMsgId: string | null

  // Attachment state
  pendingFiles: File[]
  pendingPreviews: string[]
  isUploading: boolean

  // Lightbox state
  lightboxImages: string[]
  lightboxIndex: number
  showLightbox: boolean

  // Dialog state
  showNewChat: boolean

  // useChat Synced State
  isConnected: boolean
  conversations: Conversation[]
  isLoadingConversations: boolean
  activeConversationId: string | null
  messages: Message[]
  isLoadingMessages: boolean
  isOtherPersonTyping: boolean
  currentUserId: string | null | undefined

  // useChat Synced Actions
  switchConversation: (id: string) => void
  sendMessage: (content: string, attachments?: string[]) => void
  emitTyping: (isTyping: boolean) => void
  checkOnline: (id: string) => boolean
  editMessage: (params: { messageId: string; content: string }) => Promise<any>
  deleteMessage: (params: { messageId: string; mode: 'me' | 'everyone' }) => Promise<any>
  forwardMessage: (params: { messageId: string; targetConversationIds: string[] }) => Promise<any>
  togglePinConversation: (id: string) => Promise<any>
  toggleMuteConversation: (id: string) => Promise<any>
  clearChat: (id: string) => Promise<any>
  setDisappearingMessages: (id: string, duration: number) => Promise<any>
  toggleStarMessage: (id: string) => Promise<any>
  togglePinMessage: (id: string) => Promise<any>
  reactToMessage: (params: { messageId: string; emoji: string }) => Promise<any>
  removeReaction: (id: string) => Promise<any>

  setSearchQuery: (q: string) => void
  setActiveSubTab: (tab: 'all' | 'unread' | 'bookings' | 'support') => void
  setInputText: (text: string | ((prev: string) => string)) => void
  setShowEmojiPicker: (show: boolean) => void
  setShowMobileChat: (show: boolean) => void
  setReplyTarget: (target: ReplyTarget | null) => void
  setHoveredMsgId: (id: string | null) => void

  // Attachment Actions
  setPendingFiles: (files: File[]) => void
  setPendingPreviews: (previews: string[]) => void
  setIsUploading: (uploading: boolean) => void
  addPendingFiles: (files: File[]) => void
  addPendingPreviews: (previews: string[]) => void
  removeFile: (index: number) => void
  clearAttachments: () => void

  setLightboxImages: (images: string[]) => void
  setLightboxIndex: (index: number | ((i: number) => number)) => void
  setShowLightbox: (show: boolean) => void
  openLightbox: (images: string[], startIndex: number) => void

  // Dialog Actions
  setShowNewChat: (show: boolean) => void

  // Synced state updater
  setChatData: (data: Partial<ChatStoreState>) => void
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  searchQuery: '',
  activeSubTab: 'all',
  inputText: '',
  showEmojiPicker: false,
  showMobileChat: false,
  replyTarget: null,
  hoveredMsgId: null,

  pendingFiles: [],
  pendingPreviews: [],
  isUploading: false,

  lightboxImages: [],
  lightboxIndex: 0,
  showLightbox: false,

  showNewChat: false,

  // Synced defaults
  isConnected: false,
  conversations: [],
  isLoadingConversations: false,
  activeConversationId: null,
  messages: [],
  isLoadingMessages: false,
  isOtherPersonTyping: false,
  currentUserId: null,

  // Synced default actions (noop)
  switchConversation: () => {},
  sendMessage: () => {},
  emitTyping: () => {},
  checkOnline: () => false,
  editMessage: async () => {},
  deleteMessage: async () => {},
  forwardMessage: async () => {},
  togglePinConversation: async () => {},
  toggleMuteConversation: async () => {},
  clearChat: async () => {},
  setDisappearingMessages: async () => {},
  toggleStarMessage: async () => {},
  togglePinMessage: async () => {},
  reactToMessage: async () => {},
  removeReaction: async () => {},

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveSubTab: (activeSubTab) => set({ activeSubTab }),
  setInputText: (inputText) =>
    set((state) => ({
      inputText:
        typeof inputText === 'function'
          ? inputText(state.inputText)
          : inputText,
    })),
  setShowEmojiPicker: (showEmojiPicker) => set({ showEmojiPicker }),
  setShowMobileChat: (showMobileChat) => set({ showMobileChat }),
  setReplyTarget: (replyTarget) => set({ replyTarget }),
  setHoveredMsgId: (hoveredMsgId) => set({ hoveredMsgId }),

  setPendingFiles: (pendingFiles) => set({ pendingFiles }),
  setPendingPreviews: (pendingPreviews) => set({ pendingPreviews }),
  setIsUploading: (isUploading) => set({ isUploading }),

  addPendingFiles: (files) =>
    set((state) => ({ pendingFiles: [...state.pendingFiles, ...files] })),
  addPendingPreviews: (previews) =>
    set((state) => ({
      pendingPreviews: [...state.pendingPreviews, ...previews],
    })),

  removeFile: (index) =>
    set((state) => {
      if (state.pendingPreviews[index]) {
        URL.revokeObjectURL(state.pendingPreviews[index])
      }
      return {
        pendingFiles: state.pendingFiles.filter((_, i) => i !== index),
        pendingPreviews: state.pendingPreviews.filter((_, i) => i !== index),
      }
    }),

  clearAttachments: () => {
    const { pendingPreviews } = get()
    pendingPreviews.forEach((preview) => {
      try {
        URL.revokeObjectURL(preview)
      } catch (e) {
        // ignore
      }
    })
    set({ pendingFiles: [], pendingPreviews: [] })
  },

  setLightboxImages: (lightboxImages) => set({ lightboxImages }),
  setLightboxIndex: (lightboxIndex) =>
    set((state) => ({
      lightboxIndex:
        typeof lightboxIndex === 'function'
          ? lightboxIndex(state.lightboxIndex)
          : lightboxIndex,
    })),
  setShowLightbox: (showLightbox) => set({ showLightbox }),
  openLightbox: (lightboxImages, lightboxIndex) =>
    set({
      lightboxImages,
      lightboxIndex,
      showLightbox: true,
    }),

  setShowNewChat: (showNewChat) => set({ showNewChat }),

  setChatData: (data) => set(data),
}))
