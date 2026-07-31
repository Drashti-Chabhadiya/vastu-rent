import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useChat } from '#/hook'
import { NewChatDialog } from './components/NewChatDialog'
import { DisappearingSettingsDialog } from './components/DisappearingSettingsDialog'
import { ConversationList } from './components/ConversationList'
import { ChatWindow } from './components/ChatWindow'
import { AboutPanel } from './components/AboutPanel'
import { MySettingsPanel } from './components/MySettingsPanel'
import { useChatStore } from '../../../../store/useChatStore'

export const MessagesManagement = () => {
  const chatData = useChat()
  const setChatData = useChatStore((state) => state.setChatData)

  const showLightbox = useChatStore((state) => state.showLightbox)
  const setShowLightbox = useChatStore((state) => state.setShowLightbox)
  const lightboxImages = useChatStore((state) => state.lightboxImages)
  const lightboxIndex = useChatStore((state) => state.lightboxIndex)
  const setLightboxIndex = useChatStore((state) => state.setLightboxIndex)
  const showDetailsPanel = useChatStore((state) => state.showDetailsPanel)
  const activePanel = useChatStore((state) => state.activePanel)
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  )

  // Sync useChat hook data with global Zustand store
  useEffect(() => {
    setChatData({
      isConnected: chatData.isConnected,
      conversations: chatData.conversations,
      isLoadingConversations: chatData.isLoadingConversations,
      activeConversationId: chatData.activeConversationId,
      switchConversation: chatData.switchConversation,
      messages: chatData.messages,
      isLoadingMessages: chatData.isLoadingMessages,
      sendMessage: chatData.sendMessage,
      emitTyping: chatData.emitTyping,
      isOtherPersonTyping: chatData.isOtherPersonTyping,
      checkOnline: chatData.checkOnline,
      currentUserId: chatData.currentUserId,
      editMessage: chatData.editMessage,
      deleteMessage: chatData.deleteMessage,
      forwardMessage: chatData.forwardMessage,
      togglePinConversation: chatData.togglePinConversation,
      toggleMuteConversation: chatData.toggleMuteConversation,
      clearChat: chatData.clearChat,
      setDisappearingMessages: (id: string, duration: number) =>
        chatData.setDisappearingMessages({ conversationId: id, duration }),
      toggleStarMessage: chatData.toggleStarMessage,
      togglePinMessage: chatData.togglePinMessage,
      reactToMessage: chatData.reactToMessage,
      removeReaction: chatData.removeReaction,
      archiveConversation: chatData.archiveConversation,
      unarchiveConversation: chatData.unarchiveConversation,
      updateConversationSettings: chatData.updateConversationSettings,
      blockConversation: chatData.blockConversation,
      unblockConversation: chatData.unblockConversation,
      reportConversation: chatData.reportConversation,
    })
  }, [
    chatData.isConnected,
    chatData.conversations,
    chatData.isLoadingConversations,
    chatData.activeConversationId,
    chatData.switchConversation,
    chatData.messages,
    chatData.isLoadingMessages,
    chatData.sendMessage,
    chatData.emitTyping,
    chatData.isOtherPersonTyping,
    chatData.checkOnline,
    chatData.currentUserId,
    chatData.editMessage,
    chatData.deleteMessage,
    chatData.forwardMessage,
    chatData.togglePinConversation,
    chatData.toggleMuteConversation,
    chatData.clearChat,
    chatData.setDisappearingMessages,
    chatData.toggleStarMessage,
    chatData.togglePinMessage,
    chatData.reactToMessage,
    chatData.removeReaction,
    chatData.archiveConversation,
    chatData.unarchiveConversation,
    chatData.updateConversationSettings,
    chatData.blockConversation,
    chatData.unblockConversation,
    chatData.reportConversation,
    setChatData,
  ])

  // Keyboard controls for lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!showLightbox) return
      if (e.key === 'Escape') setShowLightbox(false)
      if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i + 1) % lightboxImages.length)
      if (e.key === 'ArrowLeft')
        setLightboxIndex(
          (i) => (i - 1 + lightboxImages.length) % lightboxImages.length,
        )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLightbox, lightboxImages.length, setLightboxIndex, setShowLightbox])

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:gap-5 gap-0 lg:h-[700px] h-dvh lg:max-h-[calc(100vh-280px)] max-h-dvh overflow-hidden w-full">
        {/* ── LEFT COLUMN: Conversations List ── */}
        <ConversationList />

        {/* ── MIDDLE COLUMN: Active Chat ── */}
        <ChatWindow />

        {/* ── RIGHT COLUMN: Details Sidebar (About Panel or Settings) ── */}
        {showDetailsPanel &&
          (activePanel === 'settings' ? (
            <MySettingsPanel />
          ) : (
            activeConversationId && <AboutPanel />
          ))}
      </div>

      {/* ── New Message Dialog ── */}
      <NewChatDialog />
      <DisappearingSettingsDialog />

      {/* ── Image Lightbox Modal ── */}
      {showLightbox && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </Button>

          {/* Image counter */}
          {lightboxImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-black tracking-wider">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}

          {/* Prev button */}
          {lightboxImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(
                  (i) =>
                    (i - 1 + lightboxImages.length) % lightboxImages.length,
                )
              }}
              className="absolute left-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </Button>
          )}

          {/* Next button */}
          {lightboxImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i + 1) % lightboxImages.length)
              }}
              className="absolute right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </Button>
          )}

          {/* Main image */}
          <div
            className="relative z-10 max-w-[90vw] max-h-[88vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightboxImages[lightboxIndex]}
              src={lightboxImages[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[88vh] rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-200"
            />
          </div>

          {/* Thumbnail strip (if multiple images) */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {lightboxImages.map((src, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(i)
                  }}
                  className={cn(
                    'w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer p-0 hover:bg-transparent',
                    i === lightboxIndex
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-white/30 opacity-60 hover:opacity-90',
                  )}
                >
                  <img
                    src={src}
                    alt={`thumb-${i}`}
                    className="w-full h-full object-cover"
                  />
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
