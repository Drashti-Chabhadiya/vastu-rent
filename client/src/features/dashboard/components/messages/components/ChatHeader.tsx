import { Button } from '#/components/ui/button'
import { ArrowLeft, Leaf, Video, Phone, Search } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { ConversationOptionsMenu } from './ConversationOptionsMenu'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { formatLastActive } from '#/lib/chat-utils'
import { useChatStore } from '../../../../../store/useChatStore'
import { authClient } from '#/lib/auth/auth-client'
import { useDeleteConversation } from '#/hook'

export function ChatHeader() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false
  const deleteConversation = useDeleteConversation()

  const {
    conversations,
    activeConversationId,
    showConversationSearch,
    setShowConversationSearch,
    checkOnline,
    isOtherPersonTyping,
    archiveConversation,
    unarchiveConversation,
    setShowMobileChat,
    showDetailsPanel,
    setShowDetailsPanel,
    // Store state and actions
    setSearchText,
    setCurrentMatchIndex,
    hideMedia,
    setHideMedia,
    setRevealedMediaMsgs,
    isMultiSelectMode,
    setIsMultiSelectMode,
    setSelectedMsgIds,
  } = useChatStore()

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  if (!activeConversation) return null

  const otherPersonOnline = checkOnline(activeConversation.otherParticipant.id)
  const canSeeStatus =
    myShowOnline &&
    activeConversation.otherParticipant.lastActive !== null &&
    activeConversation.otherParticipant.lastActive !== undefined
  const showOnlineStatus = canSeeStatus && otherPersonOnline

  // Global settings for clear chat confirm trigger
  const setShowClearConfirm = (_show: boolean) => {
    // Dispatch custom event to trigger dialog or handle directly in ChatWindow.
    // Since ChatWindow consumes clear chat from store, we can use a custom event or store state.
    // Wait, let's see. In ChatWindow:
    // const [showClearConfirm, setShowClearConfirm] = useState(false)
    // We can dispatch a custom event 'open-clear-chat-dialog'
    window.dispatchEvent(new CustomEvent('open-clear-chat-dialog'))
  }

  const setShowMediaBrowser = (_show: boolean) => {
    window.dispatchEvent(new CustomEvent('open-media-browser-dialog'))
  }

  return (
    <div
      className={cn(
        'px-6',
        'py-4',
        'border-b',
        'border-border/30/70',
        'flex',
        'items-center',
        'justify-between',
        'shrink-0',
        'bg-card/80',
        'backdrop-blur-sm',
      )}
    >
      <div
        onClick={() => setShowDetailsPanel(!showDetailsPanel)}
        className="flex items-center gap-3 cursor-pointer hover:opacity-90 select-none"
      >
        {/* Back on mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            setShowMobileChat(false)
          }}
          className={cn(
            'lg:hidden',
            'h-8',
            'w-8',
            'bg-muted-light',
            'hover:bg-muted/50',
            'rounded-lg',
            'text-muted-foreground',
            'cursor-pointer',
            'transition-colors',
          )}
        >
          <ArrowLeft size={15} />
        </Button>

        <UserAvatar
          image={activeConversation.otherParticipant.image}
          name={activeConversation.otherParticipant.name}
        />

        <div>
          <div className="flex items-center gap-1">
            <h3 className={cn('text-[13px]', 'font-black', 'text-foreground', 'lowercase')}>
              {activeConversation.otherParticipant.name}
            </h3>
            {activeConversation.otherParticipant.isGreenMember && (
              <Leaf className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0" />
            )}
          </div>
          {canSeeStatus ? (
            <div className={cn('flex', 'items-center', 'mt-0.5')}>
              <span
                className={cn('text-[11px]', 'font-bold', 'text-muted-dark')}
              >
                {showOnlineStatus
                  ? 'Online'
                  : (() => {
                    const formatted = formatLastActive(activeConversation.otherParticipant.lastActive)
                    return formatted === 'Offline' ? 'Offline' : `last seen ${formatted}`
                  })()}
              </span>
              {isOtherPersonTyping && (
                <span
                  className={cn(
                    'text-[11px]',
                    'font-black',
                    'text-primary',
                    'animate-pulse',
                    'ml-1',
                  )}
                >
                  • typing...
                </span>
              )}
            </div>
          ) : (
            isOtherPersonTyping && (
              <div className={cn('flex', 'items-center', 'mt-0.5')}>
                <span
                  className={cn(
                    'text-[11px]',
                    'font-black',
                    'text-primary',
                    'animate-pulse',
                  )}
                >
                  typing...
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className={cn('flex', 'items-center', 'gap-1')}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            toast.success(`Starting video call with ${activeConversation.otherParticipant.name}...`)
          }
          className={cn(
            'w-9',
            'h-9',
            'hover:bg-muted-light',
            'rounded-xl',
            'text-muted-dark',
            'hover:text-muted-foreground',
            'cursor-pointer',
            'transition-colors',
          )}
        >
          <Video size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            toast.success(`Calling ${activeConversation.otherParticipant.name}...`)
          }
          className={cn(
            'w-9',
            'h-9',
            'hover:bg-muted-light',
            'rounded-xl',
            'text-muted-dark',
            'hover:text-muted-foreground',
            'cursor-pointer',
            'transition-colors',
          )}
        >
          <Phone size={16} />
        </Button>

        {/* Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowConversationSearch(!showConversationSearch)
            if (showConversationSearch) {
              setSearchText('')
              setCurrentMatchIndex(0)
            }
          }}
          className={cn(
            'w-9 h-9 hover:bg-muted-light rounded-xl cursor-pointer transition-colors',
            showConversationSearch ? 'text-primary bg-primary/10' : 'text-muted-dark hover:text-muted-foreground'
          )}
          title="Search Messages"
        >
          <Search size={16} />
        </Button>

        <ConversationOptionsMenu
          onViewProfile={() =>
            navigate({
              to: '/users/$id',
              params: { id: activeConversation.otherParticipant.id },
            })
          }
          isArchived={activeConversation.isArchived}
          onArchive={async () => {
            try {
              if (activeConversation.isArchived) {
                await unarchiveConversation(activeConversation.id)
                toast.success('Conversation unarchived')
              } else {
                await archiveConversation(activeConversation.id)
                toast.success('Conversation archived')
              }
            } catch {
              toast.error('Unable to update archive status')
            }
          }}
          onClearChat={() => setShowClearConfirm(true)}
          onDelete={async () => {
            try {
              await deleteConversation.mutateAsync(activeConversation.id)
              toast.success('Conversation deleted')
            } catch {
              toast.error('Failed to delete conversation')
            }
          }}
          onToggleHideMedia={() => {
            setHideMedia(!hideMedia)
            setRevealedMediaMsgs([])
          }}
          hideMedia={hideMedia}
          onToggleSelectMode={() => {
            setIsMultiSelectMode(!isMultiSelectMode)
            setSelectedMsgIds([])
          }}
          isMultiSelectMode={isMultiSelectMode}
          onShowSharedMedia={() => setShowMediaBrowser(true)}
        />
      </div>
    </div>
  )
}

