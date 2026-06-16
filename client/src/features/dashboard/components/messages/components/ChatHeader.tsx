import { Button } from '#/components/ui/button'
import { ArrowLeft, Video, Phone, Search } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { ConversationOptionsMenu } from './ConversationOptionsMenu'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { formatLastActive } from '#/lib/chat-utils'
import { useChatStore } from '../../../../../store/useChatStore'
import { authClient } from '#/lib/auth/auth-client'

export function ChatHeader() {
  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false

  const {
    conversations,
    activeConversationId,
    showConversationSearch,
    setShowConversationSearch,
    checkOnline,
    isOtherPersonTyping,
    setShowMobileChat,
    showDetailsPanel,
    setShowDetailsPanel,
    activePanel,
    setActivePanel,
    setSearchText,
    setCurrentMatchIndex,
  } = useChatStore()

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )

  if (!activeConversation) return null

  const otherPersonOnline = checkOnline(activeConversation.otherParticipant.id)
  const canSeeStatus =
    myShowOnline &&
    activeConversation.otherParticipant.lastActive !== null &&
    activeConversation.otherParticipant.lastActive !== undefined
  const showOnlineStatus = canSeeStatus && otherPersonOnline

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
        'safe-area-top', // Pad below Android/iOS status bar (viewport-fit=cover)
      )}
    >
      <div
        onClick={() => {
          if (!showDetailsPanel) {
            setActivePanel('about')
            setShowDetailsPanel(true)
          } else if (activePanel === 'settings') {
            setActivePanel('about')
          } else {
            setShowDetailsPanel(false)
          }
        }}
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
          isOnline={otherPersonOnline}
          showPing={false}
        />

        <div>
          <div className="flex items-center gap-1.5">
            <h3
              className={cn(
                'text-[15px]',
                'font-black',
                'text-foreground',
                'font-display',
              )}
            >
              {activeConversation.otherParticipant.name}
            </h3>
            {activeConversation.otherParticipant.isGreenMember && (
              <svg
                className="w-[15px] h-[15px] text-emerald-600 fill-emerald-600 shrink-0 select-none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z"
                  fill="currentColor"
                />
                <polyline
                  points="8.5 12.5 10.5 14.5 15.5 9.5"
                  stroke="white"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}
          </div>
          {canSeeStatus ? (
            <div className={cn('flex', 'items-center', 'mt-0.5')}>
              <span
                className={cn(
                  'text-[11px]',
                  'font-semibold',
                  'text-muted-dark',
                )}
              >
                {showOnlineStatus
                  ? 'Online • Typically replies in a few minutes'
                  : (() => {
                      const formatted = formatLastActive(
                        activeConversation.otherParticipant.lastActive,
                      )
                      return formatted === 'Offline'
                        ? 'Offline'
                        : `last seen ${formatted}`
                    })()}
              </span>
              {isOtherPersonTyping && (
                <span
                  className={cn(
                    'text-[11px]',
                    'font-black',
                    'text-primary',
                    'animate-pulse',
                    'ml-1.5',
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
            toast.success(
              `Starting video call with ${activeConversation.otherParticipant.name}...`,
            )
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
            toast.success(
              `Calling ${activeConversation.otherParticipant.name}...`,
            )
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
            showConversationSearch
              ? 'text-primary bg-primary/10'
              : 'text-muted-dark hover:text-muted-foreground',
          )}
          title="Search Messages"
        >
          <Search size={16} />
        </Button>

        <ConversationOptionsMenu />
      </div>
    </div>
  )
}
