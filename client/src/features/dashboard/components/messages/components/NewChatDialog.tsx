import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Search, MessageSquare, UserPlus, Leaf } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Skeleton } from '#/components/ui/skeleton'
import { useSearchChatUsers, useCreateConversation } from '#/hook'
import { toast } from 'sonner'
import { UserAvatar } from './UserAvatar'
import { authClient } from '#/lib/auth/auth-client'
import { useTranslation } from '#/context/TranslationContext'

import { useChatStore } from '../../../../../store/useChatStore'

export function NewChatDialog() {
  const { t } = useTranslation()
  const {
    showNewChat: open,
    setShowNewChat: onOpenChange,
    switchConversation,
    setShowMobileChat,
  } = useChatStore()

  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false

  const [userSearch, setUserSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null)

  // Debounced user search
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setDebouncedSearch(userSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch, open])

  const { data: userResults = [], isLoading: isSearchingUsers } =
    useSearchChatUsers(debouncedSearch, { enabled: open })

  const createConversation = useCreateConversation()

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setUserSearch('')
      setDebouncedSearch('')
    }
  }, [open])

  const handleStartChat = async (targetUserId: string, targetName: string) => {
    setStartingChatWith(targetUserId)
    try {
      const conv = await createConversation.mutateAsync(targetUserId)
      onOpenChange(false)
      await switchConversation(conv.id)
      setShowMobileChat(true)
      toast.success(`${t('Chat opened with')} ${targetName}!`)
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || t('Could not start conversation.'),
      )
    } finally {
      setStartingChatWith(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md',
          'rounded-3xl',
          'p-0',
          'overflow-hidden',
          'border-border/30',
          'shadow-2xl',
        )}
      >
        <DialogHeader
          className={cn('px-6', 'pt-6', 'pb-4', 'border-b', 'border-border/30')}
        >
          <DialogTitle
            className={cn(
              'text-[15px]',
              'font-black',
              'text-foreground',
              'flex',
              'items-center',
              'gap-2',
            )}
          >
            <UserPlus size={18} className="text-primary" />
            {t('Start New Conversation')}
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
                'text-muted-dark',
              )}
            />
            <Input
              autoFocus
              placeholder={t('Search by name...')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className={cn(
                'h-10',
                'pl-9',
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
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl"
                >
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Skeleton className="h-3.5 w-1/3 rounded" />
                    <Skeleton className="h-2.5 w-1/4 rounded" />
                  </div>
                  <Skeleton className="w-10 h-5 rounded-lg shrink-0" />
                </div>
              ))}
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
              <MessageSquare size={24} className="text-muted-foreground/30" />
              <p className={cn('text-[11px]', 'font-bold', 'text-muted-dark')}>
                {userSearch ? t('No users found') : t('Start typing to search users')}
              </p>
            </div>
          ) : (
            userResults.map((u) => (
              <Button
                key={u.id}
                variant="ghost"
                onClick={() => handleStartChat(u.id, u.name)}
                disabled={startingChatWith === u.id}
                className={cn(
                  'w-full',
                  'flex',
                  'items-center',
                  'gap-3',
                  'p-3',
                  'rounded-2xl',
                  'hover:bg-muted-light',
                  'transition-colors',
                  'cursor-pointer',
                  'justify-start',
                  'h-auto',
                  'disabled:opacity-60',
                )}
              >
                <UserAvatar
                  image={u.image}
                  name={u.name}
                  isOnline={
                    myShowOnline &&
                    u.lastActive !== null &&
                    u.lastActive !== undefined
                      ? u.isOnline
                      : undefined
                  }
                  size="sm"
                />
                <div className={cn('flex-1', 'min-w-0', 'text-left')}>
                  <div className="flex items-center gap-1 min-w-0">
                    <p
                      className={cn(
                        'text-[12px]',
                        'font-black',
                        'text-foreground',
                        'truncate',
                      )}
                    >
                      {u.name}
                    </p>
                    {u.isGreenMember && (
                      <Leaf className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-[9px]',
                      'font-bold',
                      'text-muted-dark',
                      'capitalize',
                    )}
                  >
                    {t(u.role)}
                  </p>
                </div>
                {startingChatWith === u.id ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <span
                    className={cn(
                      'text-[9px]',
                      'font-black',
                      'text-primary',
                      'bg-primary-soft',
                      'px-2',
                      'py-1',
                      'rounded-lg',
                      'shrink-0',
                    )}
                  >
                    {t('Chat')}
                  </span>
                )}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
