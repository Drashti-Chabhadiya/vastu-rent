import { create } from 'zustand'

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

  addPendingFiles: (files) => set((state) => ({ pendingFiles: [...state.pendingFiles, ...files] })),
  addPendingPreviews: (previews) => set((state) => ({ pendingPreviews: [...state.pendingPreviews, ...previews] })),

  removeFile: (index) => set((state) => {
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
  openLightbox: (lightboxImages, lightboxIndex) => set({
    lightboxImages,
    lightboxIndex,
    showLightbox: true,
  }),

  setShowNewChat: (showNewChat) => set({ showNewChat }),
}))
