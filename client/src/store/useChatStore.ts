import { create } from 'zustand'
import type { Conversation, Message } from '#/hook'

export interface ReplyTarget {
  id: string
  replyToId: string // original message's ID (for scroll-to)
  content: string
  senderName: string
  isMe: boolean
  attachments?: string[]
}

export interface ChatStoreState {
  searchQuery: string
  activeSubTab: 'all' | 'unread' | 'bookings' | 'support' | 'archived'
  inputText: string
  showEmojiPicker: boolean
  showMobileChat: boolean
  replyTarget: ReplyTarget | null
  hoveredMsgId: string | null
  highlightedMsgId: string | null

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
  showDetailsPanel: boolean
  chatWallpaper: string
  showConversationSearch: boolean
  activePanel: 'about' | 'settings'

  // New UI States
  isMultiSelectMode: boolean
  selectedMsgIds: string[]
  editingMsgId: string | null
  editingText: string
  activeReactMsgId: string | null
  fullReactMsgId: string | null
  hideMedia: boolean
  revealedMediaMsgs: string[]
  searchText: string
  currentMatchIndex: number
  deleteTargetId: string | null
  showDeleteDialog: boolean
  canDeleteForEveryone: boolean
  forwardTargetId: string | string[] | null
  showForwardDialog: boolean
  infoTargetMsg: Message | null
  showInfoDialog: boolean
  showMediaBrowser: boolean
  disappearingTargetConvId: string | null

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
  switchConversation: (id: string | null) => void
  sendMessage: (content: string, attachments?: string[]) => void
  emitTyping: (isTyping: boolean) => void
  checkOnline: (id: string) => boolean
  editMessage: (params: { messageId: string; content: string }) => Promise<any>
  deleteMessage: (params: {
    messageId: string
    mode: 'me' | 'everyone'
  }) => Promise<any>
  forwardMessage: (params: {
    messageId: string
    targetConversationIds: string[]
  }) => Promise<any>
  togglePinConversation: (id: string) => Promise<any>
  toggleMuteConversation: (id: string) => Promise<any>
  clearChat: (id: string) => Promise<any>
  setDisappearingMessages: (id: string, duration: number) => Promise<any>
  archiveConversation: (id: string) => Promise<any>
  unarchiveConversation: (id: string) => Promise<any>
  toggleStarMessage: (id: string) => Promise<any>
  togglePinMessage: (id: string) => Promise<any>
  reactToMessage: (params: { messageId: string; emoji: string }) => Promise<any>
  removeReaction: (id: string) => Promise<any>
  updateConversationSettings: (params: {
    conversationId: string
    settings: { wallpaper?: string; theme?: string }
  }) => Promise<any>
  blockConversation: (id: string) => Promise<any>
  unblockConversation: (id: string) => Promise<any>
  reportConversation: (params: {
    conversationId: string
    reason: string
  }) => Promise<any>

  setSearchQuery: (q: string) => void
  setActiveSubTab: (
    tab: 'all' | 'unread' | 'bookings' | 'support' | 'archived',
  ) => void
  setInputText: (text: string | ((prev: string) => string)) => void
  setShowEmojiPicker: (show: boolean) => void
  setShowMobileChat: (show: boolean) => void
  setReplyTarget: (target: ReplyTarget | null) => void
  setHoveredMsgId: (id: string | null) => void
  setHighlightedMsgId: (id: string | null) => void

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
  setShowDetailsPanel: (show: boolean) => void
  setShowConversationSearch: (show: boolean) => void
  setActivePanel: (panel: 'about' | 'settings') => void
  setChatWallpaper: (wallpaper: string) => void

  // New UI Actions
  setIsMultiSelectMode: (mode: boolean) => void
  setSelectedMsgIds: (ids: string[] | ((prev: string[]) => string[])) => void
  setEditingMsgId: (id: string | null) => void
  setEditingText: (text: string) => void
  setActiveReactMsgId: (id: string | null) => void
  setFullReactMsgId: (id: string | null) => void
  setHideMedia: (hide: boolean) => void
  setRevealedMediaMsgs: (ids: string[] | ((prev: string[]) => string[])) => void
  setSearchText: (text: string) => void
  setCurrentMatchIndex: (index: number) => void
  setDeleteTargetId: (id: string | null) => void
  setShowDeleteDialog: (show: boolean) => void
  setCanDeleteForEveryone: (canDelete: boolean) => void
  setForwardTargetId: (id: string | string[] | null) => void
  setShowForwardDialog: (show: boolean) => void
  setInfoTargetMsg: (msg: Message | null) => void
  setShowInfoDialog: (show: boolean) => void
  setShowMediaBrowser: (show: boolean) => void
  setDisappearingTargetConvId: (id: string | null) => void

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
  highlightedMsgId: null,

  pendingFiles: [],
  pendingPreviews: [],
  isUploading: false,

  lightboxImages: [],
  lightboxIndex: 0,
  showLightbox: false,

  showNewChat: false,
  showDetailsPanel: false,
  activePanel: 'about',

  // New UI states defaults
  isMultiSelectMode: false,
  selectedMsgIds: [],
  editingMsgId: null,
  editingText: '',
  activeReactMsgId: null,
  fullReactMsgId: null,
  hideMedia: false,
  revealedMediaMsgs: [],
  searchText: '',
  currentMatchIndex: 0,
  deleteTargetId: null,
  showDeleteDialog: false,
  canDeleteForEveryone: false,
  forwardTargetId: null,
  showForwardDialog: false,
  infoTargetMsg: null,
  showInfoDialog: false,
  showMediaBrowser: false,
  disappearingTargetConvId: null,

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
  archiveConversation: async () => {},
  unarchiveConversation: async () => {},
  toggleStarMessage: async () => {},
  togglePinMessage: async () => {},
  reactToMessage: async () => {},
  removeReaction: async () => {},
  updateConversationSettings: async () => {},
  blockConversation: async () => {},
  unblockConversation: async () => {},
  reportConversation: async () => {},

  chatWallpaper: 'classic',
  setChatWallpaper: (wallpaper: string) => set({ chatWallpaper: wallpaper }),

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
  setHighlightedMsgId: (highlightedMsgId) => set({ highlightedMsgId }),

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
  setShowDetailsPanel: (showDetailsPanel) => set({ showDetailsPanel }),
  setActivePanel: (activePanel) => set({ activePanel }),

  showConversationSearch: false,
  setShowConversationSearch: (showConversationSearch: boolean) =>
    set({ showConversationSearch }),

  // New UI Setters
  setIsMultiSelectMode: (isMultiSelectMode) => set({ isMultiSelectMode }),
  setSelectedMsgIds: (selectedMsgIds) =>
    set((state) => ({
      selectedMsgIds:
        typeof selectedMsgIds === 'function'
          ? selectedMsgIds(state.selectedMsgIds)
          : selectedMsgIds,
    })),
  setEditingMsgId: (editingMsgId) => set({ editingMsgId }),
  setEditingText: (editingText) => set({ editingText }),
  setActiveReactMsgId: (activeReactMsgId) => set({ activeReactMsgId }),
  setFullReactMsgId: (fullReactMsgId) => set({ fullReactMsgId }),
  setHideMedia: (hideMedia) => set({ hideMedia }),
  setRevealedMediaMsgs: (revealedMediaMsgs) =>
    set((state) => ({
      revealedMediaMsgs:
        typeof revealedMediaMsgs === 'function'
          ? revealedMediaMsgs(state.revealedMediaMsgs)
          : revealedMediaMsgs,
    })),
  setSearchText: (searchText) => set({ searchText }),
  setCurrentMatchIndex: (currentMatchIndex) => set({ currentMatchIndex }),
  setDeleteTargetId: (deleteTargetId) => set({ deleteTargetId }),
  setShowDeleteDialog: (showDeleteDialog) => set({ showDeleteDialog }),
  setCanDeleteForEveryone: (canDeleteForEveryone) =>
    set({ canDeleteForEveryone }),
  setForwardTargetId: (forwardTargetId) => set({ forwardTargetId }),
  setShowForwardDialog: (showForwardDialog) => set({ showForwardDialog }),
  setInfoTargetMsg: (infoTargetMsg) => set({ infoTargetMsg }),
  setShowInfoDialog: (showInfoDialog) => set({ showInfoDialog }),
  setShowMediaBrowser: (showMediaBrowser) => set({ showMediaBrowser }),
  setDisappearingTargetConvId: (disappearingTargetConvId) =>
    set({ disappearingTargetConvId }),

  setChatData: (data) => set(data),
}))
