import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '#/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { TypingBubble } from './TypingBubble'
import { useChatStore } from '../../../../../store/useChatStore'
import { Skeleton } from '#/components/ui/skeleton'
import { ForwardDialog } from './ForwardDialog'
import { MessageInfoDialog } from './MessageInfoDialog'
import { MediaBrowserDialog } from './MediaBrowserDialog'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { getDisappearingDurationText } from '#/lib/chat-utils'
import { ChatHeader } from './ChatHeader'
import { SearchPanel } from './SearchPanel'
import { MultiSelectBar } from './MultiSelectBar'
import { PinnedMessageBanner } from './PinnedMessageBanner'
import { MessageItem } from './MessageItem'
import { ChatInputDock } from './ChatInputDock'
import { DeleteMessageDialog } from './DeleteMessageDialog'
import { EmojiReactDialog } from './EmojiReactDialog'
import { MessageEmptyState } from './MessageEmptyState'

export function ChatWindow() {
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Consume Zustand global state
  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingMessages,
    isOtherPersonTyping,
    currentUserId,
    clearChat: onClearChat,
    showMobileChat,
    showDetailsPanel,
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
    setShowMediaBrowser,
  } = useChatStore()

  const wallpaperClasses: Record<
    'classic' | 'dawn' | 'forest' | 'minimal',
    string
  > = {
    classic: 'bg-emerald-50/80',
    dawn: 'bg-orange-50/80',
    forest: 'bg-emerald-100/80',
    minimal: 'bg-slate-50/80',
  }
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null
  const activeConversationSettings =
    activeConversation?.settings?.[currentUserId || '']
  const appliedWallpaper =
    activeConversationSettings?.wallpaper ?? chatWallpaper
  const wallpaperClass =
    wallpaperClasses[appliedWallpaper as keyof typeof wallpaperClasses] ??
    wallpaperClasses.classic

  // Local Component Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevConversationIdRef = useRef<string | null>(null)

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
  }, [setShowMediaBrowser])

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
  }, [
    activeConversation?.id,
    setShowConversationSearch,
    setSearchText,
    setCurrentMatchIndex,
    setIsMultiSelectMode,
    setSelectedMsgIds,
    setRevealedMediaMsgs,
    setActiveReactMsgId,
    setFullReactMsgId,
  ])

  if (!activeConversation) {
    return (
      <div
        className={cn(
          'flex-1 bg-background border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out',
          showDetailsPanel
            ? 'hidden lg:flex'
            : !showMobileChat
              ? 'hidden lg:flex'
              : 'flex',
        )}
      >
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 bg-transparent scrollbar-none">
          <MessageEmptyState showCards={true} />
        </div>
      </div>
    )
  }

  // ── Group messages by date ───────────────────────────────────────────────
  const groupedMessages = messages.reduce<{ date: string; msgs: any[] }[]>(
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
        'flex-1 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out',
        showDetailsPanel
          ? 'hidden lg:flex'
          : !showMobileChat
            ? 'hidden lg:flex'
            : 'flex',
      )}
    >
      <ChatHeader />

      {showConversationSearch && <SearchPanel />}

      {isMultiSelectMode && <MultiSelectBar />}

      <PinnedMessageBanner />

      {/* Disappearing Messages Info Banner */}
      {activeConversation.disappearingDuration
        ? activeConversation.disappearingDuration > 0 && (
            <div className="bg-muted-light/60 border-b border-border/20 px-6 py-2.5 flex items-center gap-2 text-[10px] font-bold text-muted-dark shrink-0 animate-in slide-in-from-top duration-200">
              <Clock size={12} className="text-primary shrink-0" />
              <span>
                Disappearing messages is active. Messages will disappear for
                everyone after{' '}
                {getDisappearingDurationText(
                  activeConversation.disappearingDuration,
                )}
                .
              </span>
            </div>
          )
        : null}

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
                  {!isMe && (
                    <Skeleton className="w-8 h-8 rounded-full shrink-0 self-end" />
                  )}
                  <div className="space-y-1.5">
                    <Skeleton
                      className={cn(
                        'h-9 rounded-2xl px-4 py-2.5',
                        isMe
                          ? 'bg-primary/20 rounded-tr-sm w-36'
                          : 'bg-muted rounded-tl-sm w-44',
                      )}
                    />
                    <Skeleton
                      className={cn(
                        'h-2.5 w-10 rounded',
                        isMe ? 'ml-auto' : '',
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-full py-8">
            <MessageEmptyState showCards={true} />
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
              {group.msgs.map((msg) => (
                <MessageItem key={msg.id} msg={msg} />
              ))}
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

      <ChatInputDock />

      {/* Dialogue windows */}
      <ForwardDialog />

      <MessageInfoDialog />

      <MediaBrowserDialog />

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
