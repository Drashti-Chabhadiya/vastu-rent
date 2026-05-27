import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Search,
  SlidersHorizontal,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  Check,
  PenSquare,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Wifi,
  WifiOff,
  UserPlus,
} from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { toast } from 'sonner'
import type {Conversation, Message as BaseMessage} from '../../../../hook/use-chat';
import { cn } from '#/lib/utils'
import { format } from 'date-fns'
import { apiClient } from '#/lib/api'
import { useChat } from '#/hook'

// Extend Message to support optional image attachments
type Message = BaseMessage & { images?: string[] }
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMsgTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)
  if (diffHrs < 24) return format(date, 'h:mm a')
  if (diffHrs < 48) return 'Yesterday'
  return format(date, 'dd MMM')
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ─── Sub-Components ───────────────────────────────────────────────────────────
function UserAvatar({
  image,
  name,
  isOnline,
  size = 'md',
}: {
  image: string | null
  name: string
  isOnline?: boolean
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-[10px]' : 'w-11 h-11 text-xs'
  const dotSize =
    size === 'sm' ? 'w-2.5 h-2.5 border-[2px]' : 'w-3 h-3 border-[2.5px]'
  const radius = size === 'sm' ? 'rounded-lg' : 'rounded-xl'

  return (
    <div className={cn('relative', 'shrink-0')}>
      {image ? (
        <img
          src={image}
          alt={name}
          className={cn(dim, radius, 'object-cover')}
        />
      ) : (
        <div
          className={cn(
            dim,
            radius,
            'bg-[#2d5222]/10 flex items-center justify-center font-black text-[#2d5222]',
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {isOnline !== undefined && (
        <div
          className={cn(
            dotSize,
            'absolute -bottom-0.5 -right-0.5 rounded-full border-white',
            isOnline ? 'bg-emerald-500' : 'bg-slate-300',
          )}
        />
      )}
    </div>
  )
}

function TypingBubble() {
  return (
    <div className={cn('flex', 'gap-3', 'max-w-[70%]', 'mr-auto')}>
      <div
        className={cn(
          'p-3.5',
          'rounded-2xl',
          'rounded-tl-none',
          'bg-white',
          'border',
          'border-slate-100',
          'shadow-sm',
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-1.5', 'h-4')}>
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-slate-400',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:0ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-slate-400',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:150ms]',
            )}
          />
          <span
            className={cn(
              'w-1.5',
              'h-1.5',
              'bg-slate-400',
              'rounded-full',
              'animate-bounce',
              '[animation-delay:300ms]',
            )}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
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
          'bg-[#2d5222]/10',
          'flex',
          'items-center',
          'justify-center',
        )}
      >
        <MessageSquare
          size={28}
          className="text-[#2d5222]"
          fill="currentColor"
        />
      </div>
      <div>
        <h3 className={cn('text-[13px]', 'font-black', 'text-gray-900')}>
          Select a conversation
        </h3>
        <p
          className={cn(
            'text-[11px]',
            'text-slate-400',
            'font-bold',
            'mt-1',
            'leading-relaxed',
          )}
        >
          Choose a chat from the list or start a new one.
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const MessagesManagement = () => {
  const {
    isConnected,
    conversations,
    isLoadingConversations,
    activeConversationId,
    switchConversation,
    openConversationWith,
    messages,
    isLoadingMessages,
    sendMessage,
    emitTyping,
    isOtherPersonTyping,
    checkOnline,
    currentUserId,
  } = useChat()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubTab, setActiveSubTab] = useState<
    'all' | 'unread' | 'bookings' | 'support'
  >('all')
  const [inputText, setInputText] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevConversationIdRef = useRef<string | null>(null)

  // ── New Message Dialog state ──────────────────────────────────────────────
  const [showNewChat, setShowNewChat] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<any[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null)
  const userSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced user search
  useEffect(() => {
    if (!showNewChat) return
    if (userSearchTimerRef.current) clearTimeout(userSearchTimerRef.current)
    setIsSearchingUsers(true)
    userSearchTimerRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.get('/chat/users/search', {
          params: { q: userSearch || undefined },
        })
        setUserResults(res.data)
      } catch {
        setUserResults([])
      } finally {
        setIsSearchingUsers(false)
      }
    }, 300)
  }, [userSearch, showNewChat])

  const handleStartChat = async (targetUserId: string, targetName: string) => {
    setStartingChatWith(targetUserId)
    try {
      const res = await apiClient.post('/chat/conversations', { targetUserId })
      setShowNewChat(false)
      setUserSearch('')
      await switchConversation(res.data.id)
      setShowMobileChat(true)
      toast.success(`Chat opened with ${targetName}!`)
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Could not start conversation.',
      )
    } finally {
      setStartingChatWith(null)
    }
  }

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

  // Find the active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null

  // ── Filter conversations ─────────────────────────────────────────────────
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.otherParticipant.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (conv.lastMessage?.content || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    let matchesTab = true
    if (activeSubTab === 'unread') matchesTab = conv.unreadCount > 0
    else if (activeSubTab === 'bookings')
      matchesTab = conv.otherParticipant.role === 'owner'
    else if (activeSubTab === 'support')
      matchesTab =
        conv.otherParticipant.role === 'admin' ||
        conv.otherParticipant.role === 'superAdmin'

    return matchesSearch && matchesTab
  })

  // Total unread across all conversations
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  // ── Handle typing indicator ──────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    emitTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000)
  }

  // ── Handle send ──────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!inputText.trim()) return
    if (!activeConversationId) {
      toast.error('Please select a conversation first')
      return
    }
    sendMessage(inputText)
    setInputText('')
    emitTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Handle conversation select ───────────────────────────────────────────
  const handleSelectConversation = (conv: Conversation) => {
    switchConversation(conv.id)
    setShowMobileChat(true)
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
    <div className="space-y-5">
      {/* Header */}
      <div
        className={cn(
          'flex',
          'flex-col',
          'sm:flex-row',
          'sm:items-center',
          'justify-between',
          'gap-4',
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-3')}>
          <div
            className={cn(
              'w-10',
              'h-10',
              'rounded-xl',
              'bg-[#2d5222]/10',
              'flex',
              'items-center',
              'justify-center',
              'text-[#2d5222]',
              'shrink-0',
            )}
          >
            <MessageSquare size={20} fill="currentColor" />
          </div>
          <div>
            <div className={cn('flex', 'items-center', 'gap-2')}>
              <h1 className={cn('text-xl', 'font-black', 'text-gray-900')}>
                Messages
              </h1>
              {/* Socket connection badge */}
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black',
                  isConnected
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-400',
                )}
              >
                {isConnected ? (
                  <>
                    <Wifi size={8} strokeWidth={3} /> Live
                  </>
                ) : (
                  <>
                    <WifiOff size={8} strokeWidth={3} /> Connecting...
                  </>
                )}
              </div>
            </div>
            <p
              className={cn(
                'text-[11px]',
                'text-gray-400',
                'font-bold',
                'leading-normal',
              )}
            >
              Chat with hosts, buyers and our support team.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowNewChat(true)}
          className={cn(
            'border-[#2d5222]',
            'text-[#2d5222]',
            'hover:bg-[#F4F8F1]',
            'rounded-xl',
            'text-xs',
            'font-bold',
            'flex',
            'items-center',
            'gap-2',
            'h-9',
            'px-4',
            'self-start',
            'sm:self-auto',
            'cursor-pointer',
            'shadow-none',
          )}
        >
          <PenSquare size={14} strokeWidth={2.5} />
          New Message
        </Button>
      </div>

      {/* ── New Message Dialog ── */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent
          className={cn(
            'max-w-md',
            'rounded-3xl',
            'p-0',
            'overflow-hidden',
            'border-slate-100',
            'shadow-2xl',
          )}
        >
          <DialogHeader
            className={cn(
              'px-6',
              'pt-6',
              'pb-4',
              'border-b',
              'border-slate-100',
            )}
          >
            <DialogTitle
              className={cn(
                'text-[15px]',
                'font-black',
                'text-gray-900',
                'flex',
                'items-center',
                'gap-2',
              )}
            >
              <UserPlus size={18} className="text-[#2d5222]" />
              Start New Conversation
            </DialogTitle>
          </DialogHeader>

          {/* Search bar */}
          <div className={cn('px-4', 'pt-4')}>
            <div className="relative">
              <Search
                size={13}
                className={cn(
                  'absolute',
                  'left-3',
                  'top-[13px]',
                  'text-slate-400',
                )}
              />
              <Input
                autoFocus
                placeholder="Search by name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={cn(
                  'h-10',
                  'pl-9',
                  'bg-slate-50',
                  'border-none',
                  'rounded-xl',
                  'text-[11px]',
                  'font-bold',
                  'focus-visible:ring-1',
                  'focus-visible:ring-[#2d5222]/20',
                )}
              />
            </div>
          </div>

          {/* Results list */}
          <div
            className={cn(
              'px-4',
              'pb-4',
              'mt-2',
              'max-h-72',
              'overflow-y-auto',
              'space-y-1',
              'scrollbar-thin',
            )}
          >
            {isSearchingUsers ? (
              <div
                className={cn('flex', 'items-center', 'justify-center', 'py-8')}
              >
                <Loader2
                  size={18}
                  className={cn('animate-spin', 'text-[#2d5222]')}
                />
              </div>
            ) : userResults.length === 0 ? (
              <div
                className={cn(
                  'flex',
                  'flex-col',
                  'items-center',
                  'justify-center',
                  'py-8',
                  'gap-2',
                )}
              >
                <MessageSquare size={24} className="text-slate-200" />
                <p className={cn('text-[11px]', 'font-bold', 'text-slate-400')}>
                  {userSearch
                    ? 'No users found'
                    : 'Start typing to search users'}
                </p>
              </div>
            ) : (
              userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleStartChat(u.id, u.name)}
                  disabled={startingChatWith === u.id}
                  className={cn(
                    'w-full',
                    'flex',
                    'items-center',
                    'gap-3',
                    'p-3',
                    'rounded-2xl',
                    'hover:bg-slate-50',
                    'transition-colors',
                    'border-none',
                    'bg-transparent',
                    'cursor-pointer',
                    'text-left',
                    'disabled:opacity-60',
                  )}
                >
                  <UserAvatar
                    image={u.image}
                    name={u.name}
                    isOnline={u.isOnline}
                    size="sm"
                  />
                  <div className={cn('flex-1', 'min-w-0')}>
                    <p
                      className={cn(
                        'text-[12px]',
                        'font-black',
                        'text-gray-900',
                        'truncate',
                      )}
                    >
                      {u.name}
                    </p>
                    <p
                      className={cn(
                        'text-[9px]',
                        'font-bold',
                        'text-slate-400',
                        'capitalize',
                      )}
                    >
                      {u.role}
                    </p>
                  </div>
                  {startingChatWith === u.id ? (
                    <Loader2
                      size={14}
                      className={cn(
                        'animate-spin',
                        'text-[#2d5222]',
                        'shrink-0',
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        'text-[9px]',
                        'font-black',
                        'text-[#2d5222]',
                        'bg-[#F4F8F1]',
                        'px-2',
                        'py-1',
                        'rounded-lg',
                        'shrink-0',
                      )}
                    >
                      Chat
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dual Panel */}
      <div
        className={cn(
          'flex',
          'flex-col',
          'lg:flex-row',
          'gap-5',
          'h-[720px]',
          'max-h-[calc(100vh-220px)]',
        )}
      >
        {/* ── LEFT COLUMN: Conversations List ── */}
        <div
          className={cn(
            'w-full lg:w-[380px] shrink-0 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
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
                    'text-slate-400',
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
                    'bg-slate-50',
                    'border-none',
                    'rounded-xl',
                    'text-[11px]',
                    'font-bold',
                    'focus-visible:ring-1',
                    'focus-visible:ring-[#2d5222]/20',
                  )}
                />
              </div>
              <button
                className={cn(
                  'w-10',
                  'h-10',
                  'bg-slate-50',
                  'hover:bg-slate-100',
                  'rounded-xl',
                  'flex',
                  'items-center',
                  'justify-center',
                  'text-slate-500',
                  'transition-colors',
                  'border-none',
                  'cursor-pointer',
                  'shrink-0',
                )}
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>

            {/* Subtabs */}
            <div
              className={cn(
                'flex',
                'gap-5',
                'border-b',
                'border-slate-100',
                'overflow-x-auto',
                'scrollbar-none',
              )}
            >
              {(['all', 'unread', 'bookings', 'support'] as const).map(
                (tab) => {
                  const tabUnread =
                    tab === 'unread'
                      ? totalUnread
                      : tab === 'all'
                        ? totalUnread
                        : conversations
                            .filter((c) => {
                              if (tab === 'bookings')
                                return c.otherParticipant.role === 'owner'
                              if (tab === 'support')
                                return ['admin', 'superAdmin'].includes(
                                  c.otherParticipant.role,
                                )
                              return false
                            })
                            .reduce((s, c) => s + c.unreadCount, 0)

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={cn(
                        'relative pb-3 text-[11px] font-extrabold capitalize tracking-wider whitespace-nowrap border-none bg-transparent cursor-pointer transition-colors flex items-center gap-1.5',
                        activeSubTab === tab
                          ? 'text-[#2d5222]'
                          : 'text-slate-400 hover:text-slate-600',
                      )}
                    >
                      {tab}
                      {tabUnread > 0 && (
                        <span
                          className={cn(
                            'w-4',
                            'h-4',
                            'bg-[#2d5222]',
                            'text-white',
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
                            'bg-[#2d5222]',
                            'rounded-full',
                          )}
                        />
                      )}
                    </button>
                  )
                },
              )}
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
              <div
                className={cn('flex', 'items-center', 'justify-center', 'h-32')}
              >
                <Loader2
                  size={20}
                  className={cn('animate-spin', 'text-[#2d5222]')}
                />
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
                <MessageSquare size={32} className="text-slate-200" />
                <p
                  className={cn(
                    'text-[11px]',
                    'font-bold',
                    'text-slate-400',
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
                const isOnline =
                  checkOnline(conv.otherParticipant.id) ||
                  conv.otherParticipant.isOnline

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all',
                      isSelected
                        ? 'bg-[#F4F8F1] border border-[#e2edd8]/60 shadow-sm'
                        : 'hover:bg-slate-50/60 border border-transparent',
                    )}
                  >
                    <UserAvatar
                      image={conv.otherParticipant.image}
                      name={conv.otherParticipant.name}
                      isOnline={isOnline}
                    />
                    <div className={cn('flex-1', 'min-w-0')}>
                      <div
                        className={cn(
                          'flex',
                          'items-center',
                          'justify-between',
                        )}
                      >
                        <h4
                          className={cn(
                            'text-[12px] truncate',
                            conv.unreadCount > 0
                              ? 'font-black text-gray-900'
                              : 'font-bold text-gray-800',
                          )}
                        >
                          {conv.otherParticipant.name}
                        </h4>
                        <span
                          className={cn(
                            'text-[9px]',
                            'font-bold',
                            'text-slate-400',
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
                            ? 'text-gray-900 font-extrabold'
                            : 'text-slate-400 font-medium',
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
                              'bg-[#2d5222]',
                              'text-white',
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
                              'bg-[#2d5222]',
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
              'border-slate-100',
              'px-5',
              'py-4',
              'shrink-0',
            )}
          >
            <p
              className={cn(
                'text-[10px]',
                'text-slate-400',
                'font-semibold',
                'mb-1',
              )}
            >
              Can't find your conversation?
            </p>
            <button
              className={cn(
                'text-[#2d5222]',
                'text-[10px]',
                'font-black',
                'flex',
                'items-center',
                'gap-0.5',
                'hover:underline',
                'border-none',
                'bg-transparent',
                'cursor-pointer',
                'p-0',
              )}
            >
              View archived messages <ChevronRight size={10} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Active Chat ── */}
        <div
          className={cn(
            'flex-1 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden',
            !showMobileChat ? 'hidden lg:flex' : 'flex',
          )}
        >
          {!activeConversation ? (
            <EmptyState />
          ) : (
            <>
              {/* Chat Header */}
              <div
                className={cn(
                  'px-6',
                  'py-4',
                  'border-b',
                  'border-slate-50/70',
                  'flex',
                  'items-center',
                  'justify-between',
                  'shrink-0',
                  'bg-white/80',
                  'backdrop-blur-sm',
                )}
              >
                <div className={cn('flex', 'items-center', 'gap-3')}>
                  {/* Back on mobile */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className={cn(
                      'lg:hidden',
                      'p-1.5',
                      'bg-slate-50',
                      'hover:bg-slate-100',
                      'rounded-lg',
                      'text-slate-600',
                      'border-none',
                      'cursor-pointer',
                      'transition-colors',
                    )}
                  >
                    <ArrowLeft size={15} />
                  </button>

                  <UserAvatar
                    image={activeConversation.otherParticipant.image}
                    name={activeConversation.otherParticipant.name}
                    isOnline={
                      checkOnline(activeConversation.otherParticipant.id) ||
                      activeConversation.otherParticipant.isOnline
                    }
                  />

                  <div>
                    <h3
                      className={cn(
                        'text-[13px]',
                        'font-black',
                        'text-gray-900',
                      )}
                    >
                      {activeConversation.otherParticipant.name}
                    </h3>
                    <div
                      className={cn(
                        'flex',
                        'items-center',
                        'gap-1.5',
                        'mt-0.5',
                      )}
                    >
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          checkOnline(activeConversation.otherParticipant.id) ||
                            activeConversation.otherParticipant.isOnline
                            ? 'bg-emerald-500'
                            : 'bg-slate-300',
                        )}
                      />
                      <span
                        className={cn(
                          'text-[9px]',
                          'font-bold',
                          'text-slate-400',
                        )}
                      >
                        {checkOnline(activeConversation.otherParticipant.id) ||
                        activeConversation.otherParticipant.isOnline
                          ? 'Online'
                          : 'Offline'}
                      </span>
                      {isOtherPersonTyping && (
                        <span
                          className={cn(
                            'text-[9px]',
                            'font-black',
                            'text-[#2d5222]',
                            'animate-pulse',
                            'ml-1',
                          )}
                        >
                          • typing...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={cn('flex', 'items-center', 'gap-1')}>
                  <button
                    onClick={() =>
                      toast.success(
                        `Calling ${activeConversation.otherParticipant.name}...`,
                      )
                    }
                    className={cn(
                      'w-9',
                      'h-9',
                      'hover:bg-slate-50',
                      'rounded-xl',
                      'flex',
                      'items-center',
                      'justify-center',
                      'text-slate-400',
                      'hover:text-slate-600',
                      'border-none',
                      'bg-transparent',
                      'cursor-pointer',
                      'transition-colors',
                    )}
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() =>
                      toast.success(
                        `Starting video call with ${activeConversation.otherParticipant.name}...`,
                      )
                    }
                    className={cn(
                      'w-9',
                      'h-9',
                      'hover:bg-slate-50',
                      'rounded-xl',
                      'flex',
                      'items-center',
                      'justify-center',
                      'text-slate-400',
                      'hover:text-slate-600',
                      'border-none',
                      'bg-transparent',
                      'cursor-pointer',
                      'transition-colors',
                    )}
                  >
                    <Video size={16} />
                  </button>
                  <button
                    onClick={() =>
                      toast.info('Conversation options coming soon')
                    }
                    className={cn(
                      'w-9',
                      'h-9',
                      'hover:bg-slate-50',
                      'rounded-xl',
                      'flex',
                      'items-center',
                      'justify-center',
                      'text-slate-400',
                      'hover:text-slate-600',
                      'border-none',
                      'bg-transparent',
                      'cursor-pointer',
                      'transition-colors',
                    )}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className={cn(
                  'flex-1',
                  'overflow-y-auto',
                  'px-5',
                  'py-5',
                  'space-y-5',
                  'bg-slate-50/20',
                  'scrollbar-thin',
                )}
              >
                {isLoadingMessages ? (
                  <div
                    className={cn(
                      'flex',
                      'items-center',
                      'justify-center',
                      'h-full',
                    )}
                  >
                    <div
                      className={cn(
                        'flex',
                        'flex-col',
                        'items-center',
                        'gap-3',
                      )}
                    >
                      <Loader2
                        size={24}
                        className={cn('animate-spin', 'text-[#2d5222]')}
                      />
                      <p
                        className={cn(
                          'text-[11px]',
                          'font-bold',
                          'text-slate-400',
                        )}
                      >
                        Loading messages...
                      </p>
                    </div>
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
                        'bg-slate-100',
                        'flex',
                        'items-center',
                        'justify-center',
                      )}
                    >
                      <MessageSquare size={20} className="text-slate-400" />
                    </div>
                    <p
                      className={cn(
                        'text-[11px]',
                        'font-bold',
                        'text-slate-400',
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
                            'bg-slate-100',
                            'rounded-full',
                            'text-[9px]',
                            'font-black',
                            'text-slate-400',
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
                          <div
                            key={msg.id}
                            className={cn(
                              'flex gap-2.5',
                              isMe
                                ? 'flex-row-reverse ml-auto max-w-[80%]'
                                : 'mr-auto max-w-[80%]',
                            )}
                          >
                            {/* Avatar for other person */}
                            {!isMe && (
                              <div className={cn('self-end', 'shrink-0')}>
                                <UserAvatar
                                  image={
                                    activeConversation.otherParticipant.image
                                  }
                                  name={
                                    activeConversation.otherParticipant.name
                                  }
                                  size="sm"
                                />
                              </div>
                            )}

                            <div className={cn('flex', 'flex-col', 'gap-1')}>
                              {/* Image grid (if message has images) */}
                              {(msg).images &&
                                (msg).images.length > 0 && (
                                  <div
                                    className={cn(
                                      'grid gap-1.5 rounded-2xl overflow-hidden shadow-sm',
                                      (msg).images.length === 1
                                        ? 'grid-cols-1'
                                        : 'grid-cols-3',
                                      isMe ? 'rounded-tr-sm' : 'rounded-tl-sm',
                                    )}
                                  >
                                    {(msg).images.map((src, i) => (
                                      <img
                                        key={i}
                                        src={src}
                                        alt={`attachment-${i}`}
                                        className="w-full h-24 object-cover"
                                      />
                                    ))}
                                  </div>
                                )}

                              {/* Bubble */}
                              {msg.content && (
                                <div
                                  className={cn(
                                    'px-4 py-3 text-[11px] font-semibold leading-relaxed shadow-sm',
                                    isMe
                                      ? 'bg-[#EBF3E6] text-[#2d5222] rounded-2xl rounded-tr-sm'
                                      : 'bg-white text-gray-700 border border-slate-100 rounded-2xl rounded-tl-sm',
                                  )}
                                >
                                  {msg.content}
                                </div>
                              )}

                              {/* Time + read receipt */}
                              <div
                                className={cn(
                                  'flex items-center gap-1',
                                  isMe ? 'justify-end' : 'justify-start',
                                )}
                              >
                                <span
                                  className={cn(
                                    'text-[8px]',
                                    'font-bold',
                                    'text-slate-400',
                                  )}
                                >
                                  {formatMsgTime(msg.createdAt)}
                                </span>
                                {isMe &&
                                  (msg.isRead ? (
                                    <CheckCheck
                                      size={11}
                                      className="text-emerald-600"
                                      strokeWidth={2.5}
                                    />
                                  ) : (
                                    <Check
                                      size={11}
                                      className="text-slate-400"
                                      strokeWidth={2.5}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                {isOtherPersonTyping && <TypingBubble />}
              </div>

              {/* Input Dock */}
              <div
                className={cn(
                  'p-4',
                  'border-t',
                  'border-slate-50',
                  'bg-white',
                  'flex',
                  'items-center',
                  'gap-3',
                  'shrink-0',
                )}
              >
                <button
                  onClick={() =>
                    toast.info('File attachments coming in next update!')
                  }
                  className={cn(
                    'w-10',
                    'h-10',
                    'bg-slate-50',
                    'hover:bg-slate-100',
                    'rounded-xl',
                    'flex',
                    'items-center',
                    'justify-center',
                    'text-slate-500',
                    'transition-colors',
                    'border-none',
                    'cursor-pointer',
                    'shrink-0',
                  )}
                >
                  <Paperclip size={15} />
                </button>

                <div className={cn('flex-1', 'relative')}>
                  <Input
                    placeholder={
                      isConnected ? 'Type a message...' : 'Connecting...'
                    }
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={!isConnected || !activeConversationId}
                    className={cn(
                      'h-10',
                      'pr-10',
                      'bg-slate-50',
                      'border-none',
                      'rounded-xl',
                      'text-[11px]',
                      'font-bold',
                      'focus-visible:ring-1',
                      'focus-visible:ring-[#2d5222]/20',
                      'disabled:opacity-50',
                    )}
                  />
                  <button
                    onClick={() => toast.info('Emoji picker coming soon!')}
                    className={cn(
                      'absolute',
                      'right-3',
                      'top-[11px]',
                      'text-slate-400',
                      'hover:text-slate-600',
                      'border-none',
                      'bg-transparent',
                      'cursor-pointer',
                      'transition-colors',
                    )}
                  >
                    <Smile size={15} />
                  </button>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || !isConnected}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white border-none cursor-pointer transition-all shadow-md active:scale-95 shrink-0',
                    inputText.trim() && isConnected
                      ? 'bg-[#2d5222] hover:bg-[#1d3515]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none',
                  )}
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
