import { useState } from 'react'
import { useTranslation } from '#/context/TranslationContext'
import type { CSSProperties } from 'react'
import {
  MessageSquare,
  Pin,
  BellOff,
  Clock,
  Trash2,
  Settings,
  ArrowLeftRight,
  Pencil,
  MoreVertical,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type { Conversation } from '#/hook'
import { UserAvatar } from './UserAvatar'
import { formatMsgTime } from '#/lib/chat-utils'
import { useSessionContext } from '#/context/SessionContext'
import { Skeleton } from '#/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { useChatStore } from '../../../../../store/useChatStore'
import { ConversationSearchBar } from './ConversationSearchBar'
import { ConversationSubTabs } from './ConversationSubTabs'
import { ConversationSortDropdown } from './ConversationSortDropdown'
import { toast } from 'sonner'

export function ConversationList() {
  const { t } = useTranslation()
  const { data: session } = useSessionContext()
  const myShowOnline = (session?.user)?.showOnline !== false
  const [clearChatConvId, setClearChatConvId] = useState<string | null>(null)

  const {
    conversations,
    searchQuery,
    setSearchQuery,
    activeSubTab,
    setActiveSubTab,
    isLoadingConversations,
    activeConversationId,
    currentUserId,
    showMobileChat,
    setShowMobileChat,
    switchConversation,
    togglePinConversation,
    toggleMuteConversation,
    clearChat: onClearChat,
    setShowNewChat,
    checkOnline,
    activePanel,
    setActivePanel,
    showDetailsPanel,
    setShowDetailsPanel,
    setDisappearingTargetConvId,
  } = useChatStore()

  const [sortBy, setSortBy] = useState<'recent' | 'unread' | 'name'>('recent')
  const [filterOnline, setFilterOnline] = useState(false)
  const [filterGreen, setFilterGreen] = useState(false)

  // ── Filter & Sort conversations ───────────────────────────────────────────
  const filteredConversations = conversations
    .filter((conv) => {
      const matchesSearch =
        conv.otherParticipant.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage?.content || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

      const isArchived = conv.isArchived === true

      if (activeSubTab !== 'archived' && isArchived) return false
      if (activeSubTab === 'archived' && !isArchived) return false

      let matchesTab = true
      if (activeSubTab === 'unread') matchesTab = conv.unreadCount > 0
      else if (activeSubTab === 'bookings')
        matchesTab = conv.otherParticipant.role === 'user'
      else if (activeSubTab === 'support')
        matchesTab = conv.otherParticipant.role === 'admin'

      const otherPersonOnline = checkOnline(conv.otherParticipant.id)
      const satisfiesOnlineFilter = !filterOnline || otherPersonOnline
      const satisfiesGreenFilter =
        !filterGreen || conv.otherParticipant.isGreenMember

      return (
        matchesSearch &&
        matchesTab &&
        satisfiesOnlineFilter &&
        satisfiesGreenFilter
      )
    })
    .sort((a, b) => {
      const aPinned = a.pinnedBy?.includes(currentUserId || '') ? 1 : 0
      const bPinned = b.pinnedBy?.includes(currentUserId || '') ? 1 : 0
      if (aPinned !== bPinned) return bPinned - aPinned

      if (sortBy === 'unread') {
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount
        }
      } else if (sortBy === 'name') {
        return a.otherParticipant.name.localeCompare(b.otherParticipant.name)
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  // Total unread across all conversations
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  const handleSelectConversation = (conv: Conversation) => {
    switchConversation(conv.id)
    setShowMobileChat(true)
  }

  return (
    <div
      className={cn(
        'shrink-0 flex-1 h-full bg-card lg:rounded-[2.5rem] shadow-none lg:shadow-sm flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out lg:border lg:border-border/30 safe-area-top',
        showDetailsPanel
          ? 'w-0 lg:w-[84px] p-2 hidden lg:flex'
          : showMobileChat
            ? 'hidden lg:flex w-full lg:w-[380px] opacity-100'
            : 'flex w-full lg:w-[380px] opacity-100',
      )}
    >
      {/* ── Messages Header Section ── */}
      <div
        className={cn(
          'px-6 pt-6 pb-2 shrink-0 select-none',
          showDetailsPanel && 'px-1 pt-4 pb-2 flex flex-col items-center',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between w-full',
            showDetailsPanel && 'flex-col gap-2 justify-center',
          )}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className={cn(
                'w-9 h-9 rounded-full bg-muted/50 dark:bg-muted/40 border border-border/30 flex items-center justify-center cursor-pointer text-foreground hover:bg-muted/75 shrink-0 transition-colors lg:hidden',
                showDetailsPanel && 'hidden',
              )}
            >
              <ArrowLeft size={16} />
            </button>
            <h1
              className={cn(
                'text-2xl font-display font-medium text-foreground tracking-tight',
                showDetailsPanel && 'hidden',
              )}
            >
              Messages
            </h1>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5',
              showDetailsPanel && 'flex-col gap-2 justify-center',
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSortBy(sortBy === 'recent' ? 'unread' : 'recent')
                toast.success(
                  `Sorting by ${sortBy === 'recent' ? 'Unread count' : 'Recent activity'}`,
                )
              }}
              className={cn(
                'w-8 h-8 rounded-lg hover:bg-muted-light text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
                showDetailsPanel && 'hidden',
              )}
              title="Sort chat list"
            >
              <ArrowLeftRight size={14} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const isOpening =
                  activePanel !== 'settings' || !showDetailsPanel
                setActivePanel(isOpening ? 'settings' : 'about')
                setShowDetailsPanel(isOpening)
              }}
              className={cn(
                'w-8 h-8 rounded-lg hover:bg-muted-light text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
                activePanel === 'settings' &&
                showDetailsPanel &&
                'text-emerald-700 bg-emerald-50',
              )}
              title="Settings"
            >
              <Settings size={14} />
            </Button>
          </div>
        </div>
        <p
          className={cn(
            'text-[11px] text-muted-foreground font-medium mt-1',
            showDetailsPanel && 'hidden',
          )}
        >
          {t('Stay connected and build real rapports.')}
        </p>
      </div>

      {/* Search + Filter + SubTabs */}
      <div
        className={cn('px-6 pb-4 pt-1 shrink-0', showDetailsPanel && 'hidden')}
      >
        <ConversationSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        >
          <ConversationSortDropdown
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterOnline={filterOnline}
            setFilterOnline={setFilterOnline}
            filterGreen={filterGreen}
            setFilterGreen={setFilterGreen}
            activePanel={activePanel}
            showDetailsPanel={showDetailsPanel}
            setActivePanel={setActivePanel}
            setShowDetailsPanel={setShowDetailsPanel}
          />
        </ConversationSearchBar>
        <ConversationSubTabs
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          conversations={conversations}
          totalUnread={totalUnread}
        />
      </div>

      {/* Chat Items */}
      <div
        className={cn(
          'flex-1',
          'overflow-y-auto',
          'px-4',
          'pb-4',
          'pt-1',
          'space-y-1',
          'scrollbar-thin',
          showDetailsPanel && 'px-1',
        )}
      >
        {isLoadingConversations ? (
          <div className="space-y-1.5 p-1 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3.5 p-3.5 rounded-2xl border border-transparent',
                  showDetailsPanel && 'justify-center p-1.5 rounded-xl gap-0',
                )}
              >
                <Skeleton className="w-11 h-11 rounded-full shrink-0 bg-muted-light" />
                <div
                  className={cn(
                    'flex-1 space-y-2 min-w-0',
                    showDetailsPanel && 'hidden',
                  )}
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28 rounded bg-muted-light" />
                    <Skeleton className="h-3 w-10 rounded bg-muted-light" />
                  </div>
                  <Skeleton className="h-3.5 w-3/4 rounded bg-muted-light" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div
            className={cn(
              'flex',
              'flex-col',
              'items-center',
              'justify-center',
              'h-full',
              'gap-3',
              'py-10',
            )}
          >
            <MessageSquare size={32} className="text-muted-foreground/30" />
            <p
              className={cn(
                'text-[11px]',
                'font-bold',
                'text-muted-dark',
                'text-center',
              )}
            >
              {searchQuery
                ? t('No conversations match your search.')
                : t('No conversations yet.')}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id
            const isPinned = conv.pinnedBy?.includes(currentUserId || '')
            const isMuted = conv.mutedBy?.includes(currentUserId || '')
            const hasDisappearing = (conv.disappearingDuration || 0) > 0

            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                style={
                  isSelected
                    ? ({
                      '--card': 'var(--brand-green-bubble)',
                    } as CSSProperties)
                    : undefined
                }
                className={cn(
                  'group flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all relative overflow-hidden',
                  isSelected
                    ? 'bg-[var(--card)] shadow-none'
                    : 'hover:bg-muted-light/40 border border-transparent',
                  showDetailsPanel && 'justify-center gap-0 p-1.5 rounded-2xl',
                )}
              >
                {isSelected && (
                  <div
                    className={cn(
                      'absolute right-0 top-0 bottom-0 w-[3px] bg-brand-primary-deep',
                      showDetailsPanel && 'hidden',
                    )}
                  />
                )}
                <UserAvatar
                  image={conv.otherParticipant.image}
                  name={conv.otherParticipant.name}
                  isOnline={
                    myShowOnline &&
                      conv.otherParticipant.lastActive !== null &&
                      conv.otherParticipant.lastActive !== undefined
                      ? conv.otherParticipant.isOnline
                      : undefined
                  }
                />
                <div
                  className={cn(
                    'flex-1 min-w-0 flex flex-col gap-1',
                    showDetailsPanel && 'hidden',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <h4
                        className={cn(
                          'text-sm font-semibold text-foreground truncate font-sans tracking-tight',
                        )}
                      >
                        {conv.otherParticipant.name}
                      </h4>
                      {conv.otherParticipant.isGreenMember && (
                        <svg
                          className="w-[15px] h-[15px] text-emerald-600 fill-emerald-600 shrink-0 select-none animate-fade-in"
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
                    <span className="text-[11px] font-medium text-muted-dark shrink-0 ml-2">
                      {conv.lastMessage
                        ? formatMsgTime(conv.lastMessage.createdAt)
                        : formatMsgTime(conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-[12px] truncate flex-1 min-w-0 font-sans',
                        conv.unreadCount > 0
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground font-normal',
                      )}
                    >
                      {conv.lastMessage
                        ? conv.lastMessage.senderId === currentUserId
                          ? `You: ${conv.lastMessage.content}`
                          : conv.lastMessage.content
                        : 'No messages yet'}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPinned && (
                        <Pin
                          size={11}
                          className="text-primary fill-primary rotate-45 shrink-0"
                        />
                      )}
                      {isMuted && (
                        <BellOff
                          size={11}
                          className="text-muted-dark shrink-0"
                        />
                      )}
                      {hasDisappearing && (
                        <Clock size={11} className="text-muted-dark shrink-0" />
                      )}

                      {conv.unreadCount > 0 && (
                        <span className="w-2.5 h-2.5 bg-warning rounded-full shrink-0 ml-2 animate-pulse" />
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            className="w-6 h-6 rounded-lg hover:bg-muted text-muted-dark hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 cursor-pointer p-0 shrink-0"
                          >
                            <MoreVertical size={12} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-2xl p-1.5 shadow-xl border border-border/30 bg-card"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation()
                              await togglePinConversation(conv.id)
                            }}
                            className="rounded-xl text-[11px] font-bold py-2 px-3 text-foreground/90 cursor-pointer"
                          >
                            <Pin size={13} className="mr-2 rotate-45" />
                            {isPinned ? t('Unpin Chat') : t('Pin Chat')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation()
                              await toggleMuteConversation(conv.id)
                            }}
                            className="rounded-xl text-[11px] font-bold py-2 px-3 text-foreground/90 cursor-pointer"
                          >
                            <BellOff size={13} className="mr-2" />
                            {isMuted ? t('Unmute') : t('Mute')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setDisappearingTargetConvId(conv.id)
                            }}
                            className="rounded-xl text-[11px] font-bold py-2 px-3 text-foreground/90 cursor-pointer"
                          >
                            <Clock size={13} className="mr-2" />
                            Disappearing Messages
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 border-border/10" />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setClearChatConvId(conv.id)
                            }}
                            className="rounded-xl text-[11px] font-bold py-2 px-3 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 size={13} className="mr-2" />
                            Clear Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <ReusableAlertDialog
        isOpen={!!clearChatConvId}
        onOpenChange={(open) => !open && setClearChatConvId(null)}
        onConfirm={async () => {
          if (clearChatConvId) {
            try {
              await onClearChat(clearChatConvId)
            } catch (err) {
              console.error('Failed to clear chat:', err)
            } finally {
              setClearChatConvId(null)
            }
          }
        }}
        title={t('Clear Chat?')}
        description={t(
          'Are you sure you want to clear this chat? This action cannot be undone.',
        )}
        confirmText={t('Clear')}
        variant="danger"
      />

      <Button
        onClick={() => setShowNewChat(true)}
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-brand-primary-deep hover:bg-brand-primary-darker text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer z-20 p-0"
      >
        <Pencil size={16} />
      </Button>
    </div>
  )
}
