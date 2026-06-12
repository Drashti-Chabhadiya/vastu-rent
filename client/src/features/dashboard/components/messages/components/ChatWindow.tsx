import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Clock,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useUploadChatFile } from '#/hook'
import type { Message } from '../../../../../hook/use-chat'
import { TypingBubble } from './TypingBubble'
import { useChatStore } from '../../../../../store/useChatStore'
import { Skeleton } from '#/components/ui/skeleton'
import { ForwardDialog } from './ForwardDialog'
import { MessageInfoDialog } from './MessageInfoDialog'
import { MediaBrowserDialog } from './MediaBrowserDialog'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { buildReplyContent, getDisappearingDurationText } from '#/lib/chat-utils'
import { ChatHeader } from './ChatHeader'
import { SearchPanel } from './SearchPanel'
import { MultiSelectBar } from './MultiSelectBar'
import { PinnedMessageBanner } from './PinnedMessageBanner'
import { MessageItem } from './MessageItem'
import { ChatInputDock } from './ChatInputDock'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { DeleteMessageDialog } from './DeleteMessageDialog'
import { EmojiReactDialog } from './EmojiReactDialog'

export function ChatWindow() {
  const uploadChatFile = useUploadChatFile()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Consume Zustand global state
  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingMessages,
    isOtherPersonTyping,
    currentUserId,
    sendMessage,
    emitTyping,
    clearChat: onClearChat,
    togglePinMessage,
    forwardMessage,
    showMobileChat,
    replyTarget,
    setReplyTarget,
    pendingFiles,
    addPendingFiles,
    addPendingPreviews,
    clearAttachments,
    inputText,
    setInputText,
    setIsUploading,
    chatWallpaper,
    isMultiSelectMode,
    setIsMultiSelectMode,
    setSelectedMsgIds,
    setRevealedMediaMsgs,
    setActiveReactMsgId,
    setFullReactMsgId,
    setSearchText,
    setCurrentMatchIndex,
    showConversationSearch,
    setShowConversationSearch,
    forwardTargetId,
    showForwardDialog,
    setShowForwardDialog,
    infoTargetMsg,
    showInfoDialog,
    setShowInfoDialog,
  } = useChatStore()

  const wallpaperClasses: Record<'classic' | 'dawn' | 'forest' | 'minimal', string> = {
    classic: 'bg-emerald-50/80',
    dawn: 'bg-orange-50/80',
    forest: 'bg-emerald-100/80',
    minimal: 'bg-slate-50/80',
  }
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null
  const activeConversationSettings = activeConversation?.settings?.[currentUserId || '']
  const appliedWallpaper =
    activeConversationSettings?.wallpaper ?? chatWallpaper
  const wallpaperClass =
    wallpaperClasses[appliedWallpaper as keyof typeof wallpaperClasses] ??
    wallpaperClasses.classic

  // Local Component Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevConversationIdRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Audio recording custom hook
  const {
    isRecording,
    recordingSeconds,
    isSimulatedRecording,
    startRecording,
    cancelRecording,
    stopAndSendRecording,
  } = useAudioRecorder()

  // Custom event listeners for communication with Header / other parts
  useEffect(() => {
    const handleOpenClearChat = () => setShowClearConfirm(true)
    const handleOpenMedia = () => setShowMediaBrowser(true)

    window.addEventListener('open-clear-chat-dialog', handleOpenClearChat)
    window.addEventListener('open-media-browser-dialog', handleOpenMedia)

    return () => {
      window.removeEventListener('open-clear-chat-dialog', handleOpenClearChat)
      window.removeEventListener('open-media-browser-dialog', handleOpenMedia)
    }
  }, [])

  // Shared Media Browser state
  const [showMediaBrowser, setShowMediaBrowser] = useState(false)

  useEffect(() => {
    const handleScrollToMsg = (e: any) => {
      if (e.detail && e.detail.messageId) {
        scrollToMessage(e.detail.messageId)
      }
    }
    window.addEventListener('scroll-to-chat-msg', handleScrollToMsg)
    return () => {
      window.removeEventListener('scroll-to-chat-msg', handleScrollToMsg)
    }
  }, [messages])

  // Auto-scroll to bottom when messages change or conversation switches
  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) {
      const isSameConv = prevConversationIdRef.current === activeConversationId
      el.scrollTo({
        top: el.scrollHeight,
        behavior: isSameConv ? 'smooth' : 'auto',
      })
    }
    prevConversationIdRef.current = activeConversationId
  }, [messages, isOtherPersonTyping, activeConversationId])

  // ── Handle typing indicator ──────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    emitTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000)
  }

  // ── Handle send ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const hasText = inputText.trim().length > 0
    const hasFiles = pendingFiles.length > 0
    if (!hasText && !hasFiles) return
    if (!activeConversationId) {
      toast.error('Please select a conversation first')
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload any pending file attachments
      let uploadedUrls: string[] = []
      if (hasFiles) {
        const uploads = await Promise.all(
          pendingFiles.map(async (file) => {
            return await uploadChatFile.mutateAsync(file)
          }),
        )
        uploadedUrls = uploads
      }

      // 2. Build final message content
      const finalContent = replyTarget
        ? buildReplyContent(replyTarget.content, inputText.trim())
        : inputText.trim()

      // 3. Send via socket
      sendMessage(finalContent, uploadedUrls)

      // 4. Reset state
      setInputText('')
      setReplyTarget(null)
      clearAttachments()
      emitTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload attachment')
    } finally {
      setIsUploading(false)
    }
  }

  // ── Handle file selection ─────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    // Limit to 5 images
    const allowed = files.slice(0, 5 - pendingFiles.length)
    const newPreviews = allowed.map((f) => URL.createObjectURL(f))
    addPendingFiles(allowed)
    addPendingPreviews(newPreviews)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-yellow-200/40', 'transition-all', 'duration-500')
      setTimeout(() => {
        el.classList.remove('bg-yellow-200/40')
      }, 2000)
    }
  }

  // Pinned messages banner calculation
  const pinnedMessages = messages.filter(
    (m) => !m.isDeleted && m.pinnedBy && m.pinnedBy.length > 0,
  )
  const activePinnedMessage = pinnedMessages[pinnedMessages.length - 1] || null

  // Reset search, multi-select, and revealed media messages on conversation change
  useEffect(() => {
    setShowConversationSearch(false)
    setSearchText('')
    setCurrentMatchIndex(0)
    setIsMultiSelectMode(false)
    setSelectedMsgIds([])
    setRevealedMediaMsgs([])
    setActiveReactMsgId(null)
    setFullReactMsgId(null)
  }, [activeConversation?.id])

  if (!activeConversation) {
    return (
      <div
        className={cn(
          'flex-1 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
          !showMobileChat ? 'hidden lg:flex' : 'flex',
        )}
      >
        <div
          className={cn(
            'flex-1',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'gap-4',
            'text-center',
            'px-8',
          )}
        >
          <div
            className={cn(
              'w-16',
              'h-16',
              'rounded-2xl',
              'bg-primary/10',
              'flex',
              'items-center',
              'justify-center',
            )}
          >
            <MessageSquare
              size={28}
              className="text-primary"
              fill="currentColor"
            />
          </div>
          <div>
            <h3 className={cn('text-[13px]', 'font-black', 'text-foreground')}>
              Select a conversation
            </h3>
            <p
              className={cn(
                'text-[11px]',
                'text-muted-dark',
                'font-bold',
                'mt-1',
                'leading-relaxed',
              )}
            >
              Choose a chat from the list or start a new one.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Group messages by date ───────────────────────────────────────────────
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>(
    (groups, msg) => {
      const dateKey = format(new Date(msg.createdAt), 'dd MMM yyyy')
      const last = groups[groups.length - 1]
      if (last && last.date === dateKey) {
        last.msgs.push(msg)
      } else {
        groups.push({ date: dateKey, msgs: [msg] })
      }
      return groups
    },
    [],
  )

  return (
    <div
      className={cn(
        'flex-1 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden relative',
        !showMobileChat ? 'hidden lg:flex' : 'flex',
      )}
    >
      <ChatHeader />

      {showConversationSearch && <SearchPanel />}

      {isMultiSelectMode && <MultiSelectBar />}

      {activePinnedMessage && (
        <PinnedMessageBanner
          activePinnedMessage={activePinnedMessage}
          togglePinMessage={togglePinMessage}
          scrollToMessage={scrollToMessage}
        />
      )}

      {/* Disappearing Messages Info Banner */}
      {activeConversation.disappearingDuration ? activeConversation.disappearingDuration > 0 && (
        <div className="bg-muted-light/60 border-b border-border/20 px-6 py-2.5 flex items-center gap-2 text-[10px] font-bold text-muted-dark shrink-0 animate-in slide-in-from-top duration-200">
          <Clock size={12} className="text-primary shrink-0" />
          <span>Disappearing messages is active. Messages will disappear for everyone after {getDisappearingDurationText(activeConversation.disappearingDuration)}.</span>
        </div>
      ) : null}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className={cn(
          'flex-1',
          'overflow-y-auto',
          'px-5',
          'py-5',
          'space-y-5',
          wallpaperClass,
          'scrollbar-thin',
        )}
      >
        {isLoadingMessages ? (
          <div className="space-y-6 px-1 py-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => {
              const isMe = i % 2 === 1
              return (
                <div
                  key={i}
                  className={cn(
                    'flex gap-2.5 max-w-[70%]',
                    isMe ? 'ml-auto flex-row-reverse' : 'mr-auto',
                  )}
                >
                  {!isMe && <Skeleton className="w-8 h-8 rounded-full shrink-0 self-end" />}
                  <div className="space-y-1.5">
                    <Skeleton
                      className={cn(
                        'h-9 rounded-2xl px-4 py-2.5',
                        isMe ? 'bg-primary/20 rounded-tr-sm w-36' : 'bg-muted rounded-tl-sm w-44',
                      )}
                    />
                    <Skeleton className={cn('h-2.5 w-10 rounded', isMe ? 'ml-auto' : '')} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : messages.length === 0 ? (
          <div
            className={cn(
              'flex',
              'flex-col',
              'items-center',
              'justify-center',
              'h-full',
              'gap-3',
            )}
          >
            <div
              className={cn(
                'w-12',
                'h-12',
                'rounded-2xl',
                'bg-muted/50',
                'flex',
                'items-center',
                'justify-center',
              )}
            >
              <MessageSquare size={20} className="text-muted-dark" />
            </div>
            <p
              className={cn(
                'text-[11px]',
                'font-bold',
                'text-muted-dark',
                'text-center',
              )}
            >
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date} className="space-y-3">
              {/* Date separator */}
              <div className={cn('flex', 'justify-center')}>
                <span
                  className={cn(
                    'px-3',
                    'py-1',
                    'bg-muted/50',
                    'rounded-full',
                    'text-[9px]',
                    'font-black',
                    'text-muted-dark',
                    'uppercase',
                    'tracking-widest',
                  )}
                >
                  {group.date === format(new Date(), 'dd MMM yyyy')
                    ? 'Today'
                    : group.date}
                </span>
              </div>

              {/* Messages */}
              {group.msgs.map((msg) => {
                const isMe = msg.senderId === currentUserId

                return (
                  <MessageItem
                    key={msg.id}
                    msg={msg}
                    isMe={isMe}
                    otherParticipant={activeConversation.otherParticipant}
                  />
                )
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isOtherPersonTyping && (
          <TypingBubble
            name={activeConversation.otherParticipant.name}
            image={activeConversation.otherParticipant.image}
          />
        )}
      </div>

      <ChatInputDock
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleSend={handleSend}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        isSimulatedRecording={isSimulatedRecording}
        handleStartRecording={startRecording}
        handleCancelRecording={cancelRecording}
        handleStopAndSendRecording={stopAndSendRecording}
        inputRef={inputRef}
      />

      {/* Dialogue windows */}
      <ForwardDialog
        open={showForwardDialog}
        onOpenChange={setShowForwardDialog}
        messageId={forwardTargetId}
        conversations={conversations}
        onForward={(messageId, targetConversationIds) =>
          forwardMessage({ messageId, targetConversationIds })
        }
      />

      <MessageInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        message={infoTargetMsg}
      />

      <MediaBrowserDialog
        open={showMediaBrowser}
        onOpenChange={setShowMediaBrowser}
        messages={messages}
      />

      <EmojiReactDialog />
      <DeleteMessageDialog />

      {activeConversation && (
        <ReusableAlertDialog
          isOpen={showClearConfirm}
          onOpenChange={setShowClearConfirm}
          onConfirm={async () => {
            try {
              await onClearChat(activeConversation.id)
              toast.success('Chat cleared')
            } catch {
              toast.error('Failed to clear chat')
            } finally {
              setShowClearConfirm(false)
            }
          }}
          title="Clear Chat?"
          description="Are you sure you want to clear this chat? This action cannot be undone."
          confirmText="Clear"
          variant="danger"
        />
      )}
    </div>
  )
}
