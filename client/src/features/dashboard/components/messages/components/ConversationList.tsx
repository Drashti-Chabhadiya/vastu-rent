import {
  Search,
  MessageSquare,
  SlidersHorizontal,
  ChevronRight,
  Leaf,
} from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type { Conversation } from '../../../../../hook/use-chat'
import { UserAvatar } from './UserAvatar'
import { formatMsgTime } from '#/lib/chat-utils'
import { authClient } from '#/lib/auth/auth-client'
import { Skeleton } from '#/components/ui/skeleton'


interface ConversationListProps {
  conversations: Conversation[]
  filteredConversations: Conversation[]
  activeConversationId: string | null
  onSelect: (conv: Conversation) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeSubTab: 'all' | 'unread' | 'bookings' | 'support'
  setActiveSubTab: (tab: 'all' | 'unread' | 'bookings' | 'support') => void
  isLoadingConversations: boolean
  currentUserId: string | null | undefined
  totalUnread: number
  showMobileChat: boolean
}

export function ConversationList({
  conversations,
  filteredConversations,
  activeConversationId,
  onSelect,
  searchQuery,
  setSearchQuery,
  activeSubTab,
  setActiveSubTab,
  isLoadingConversations,
  currentUserId,
  totalUnread,
  showMobileChat,
}: ConversationListProps) {
  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false

  return (
    <div
      className={cn(
        'w-full lg:w-[380px] shrink-0 bg-card border border-border/30 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
        showMobileChat ? 'hidden lg:flex' : 'flex',
      )}
    >
      {/* Search + Filter */}
      <div className={cn('p-5', 'pb-0', 'shrink-0')}>
        <div className={cn('flex', 'items-center', 'gap-2', 'mb-4')}>
          <div className={cn('relative', 'flex-1')}>
            <Search
              size={13}
              className={cn(
                'absolute',
                'left-3',
                'top-[13px]',
                'text-muted-dark',
              )}
            />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'h-10',
                'pl-9',
                'pr-4',
                'bg-muted-light',
                'border-none',
                'rounded-xl',
                'text-[11px]',
                'font-bold',
                'focus-visible:ring-1',
                'focus-visible:ring-primary/20',
              )}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-10',
              'h-10',
              'bg-muted-light',
              'hover:bg-muted/50',
              'rounded-xl',
              'text-muted-foreground/85',
              'transition-colors',
              'cursor-pointer',
              'shrink-0',
            )}
          >
            <SlidersHorizontal size={14} />
          </Button>
        </div>

        {/* Sub-tabs */}
        <div
          className={cn(
            'flex',
            'gap-5',
            'border-b',
            'border-border/30',
            'overflow-x-auto',
            'scrollbar-none',
          )}
        >
          {(['all', 'unread', 'bookings', 'support'] as const).map((tab) => {
            const tabUnread =
              tab === 'unread'
                ? totalUnread
                : tab === 'all'
                  ? totalUnread
                  : conversations
                      .filter((c) => {
                        if (tab === 'bookings')
                          return c.otherParticipant.role === 'user'
                        if (tab === 'support')
                          return c.otherParticipant.role === 'admin'
                        return false
                      })
                      .reduce((s, c) => s + c.unreadCount, 0)

            return (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveSubTab(tab)}
                className={cn(
                  'relative pb-3 text-[11px] font-extrabold capitalize tracking-wider whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 rounded-none h-auto px-0 hover:bg-transparent',
                  activeSubTab === tab
                    ? 'text-primary'
                    : 'text-muted-dark hover:text-muted-foreground',
                )}
              >
                {tab}
                {tabUnread > 0 && (
                  <span
                    className={cn(
                      'w-4',
                      'h-4',
                      'bg-primary',
                      'text-primary-foreground',
                      'text-[9px]',
                      'font-black',
                      'rounded-full',
                      'flex',
                      'items-center',
                      'justify-center',
                    )}
                  >
                    {tabUnread > 9 ? '9+' : tabUnread}
                  </span>
                )}
                {activeSubTab === tab && (
                  <div
                    className={cn(
                      'absolute',
                      'bottom-0',
                      'left-0',
                      'right-0',
                      'h-[2px]',
                      'bg-primary',
                      'rounded-full',
                    )}
                  />
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Chat Items */}
      <div
        className={cn(
          'flex-1',
          'overflow-y-auto',
          'p-3',
          'space-y-0.5',
          'scrollbar-thin',
        )}
      >
        {isLoadingConversations ? (
          <div className="space-y-2.5 p-1 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-transparent">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                  <Skeleton className="h-3 w-3/4 rounded" />
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
                ? 'No conversations match your search.'
                : 'No conversations yet.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all',
                  isSelected
                    ? 'bg-primary-soft border border-primary-border/60 shadow-sm'
                    : 'hover:bg-muted-light/60 border border-transparent',
                )}
              >
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
                <div className={cn('flex-1', 'min-w-0')}>
                  <div
                    className={cn('flex', 'items-center', 'justify-between')}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <h4
                        className={cn(
                          'text-[12px] truncate',
                          conv.unreadCount > 0
                            ? 'font-black text-foreground'
                            : 'font-bold text-foreground/90',
                        )}
                      >
                        {conv.otherParticipant.name}
                      </h4>
                      {conv.otherParticipant.isGreenMember && (
                        <Leaf className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[9px]',
                        'font-bold',
                        'text-muted-dark',
                        'shrink-0',
                        'ml-2',
                      )}
                    >
                      {conv.lastMessage
                        ? formatMsgTime(conv.lastMessage.createdAt)
                        : formatMsgTime(conv.updatedAt)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-[10px] truncate mt-0.5',
                      conv.unreadCount > 0
                        ? 'text-foreground font-extrabold'
                        : 'text-muted-dark font-medium',
                    )}
                  >
                    {conv.lastMessage
                      ? conv.lastMessage.senderId === currentUserId
                        ? `You: ${conv.lastMessage.content}`
                        : conv.lastMessage.content
                      : 'No messages yet'}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <div className="shrink-0">
                    {conv.unreadCount > 1 ? (
                      <span
                        className={cn(
                          'w-5',
                          'h-5',
                          'bg-primary',
                          'text-primary-foreground',
                          'text-[9px]',
                          'font-black',
                          'rounded-full',
                          'flex',
                          'items-center',
                          'justify-center',
                        )}
                      >
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    ) : (
                      <div
                        className={cn(
                          'w-2.5',
                          'h-2.5',
                          'bg-primary',
                          'rounded-full',
                        )}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Left Footer */}
      <div
        className={cn(
          'border-t',
          'border-border/30',
          'px-5',
          'py-4',
          'shrink-0',
        )}
      >
        <p
          className={cn(
            'text-[10px]',
            'text-muted-dark',
            'font-semibold',
            'mb-1',
          )}
        >
          Can't find your conversation?
        </p>
        <Button
          variant="ghost"
          className={cn(
            'text-primary',
            'text-[10px]',
            'font-black',
            'flex',
            'items-center',
            'gap-0.5',
            'hover:underline',
            'cursor-pointer',
            'h-auto',
            'p-0',
            'hover:bg-transparent',
          )}
        >
          View archived messages <ChevronRight size={10} strokeWidth={3} />
        </Button>
      </div>
    </div>
  )
}
