import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Search, MessageSquare, UserPlus, Loader2 } from 'lucide-react'
import { cn } from '#/lib/utils'
import { apiClient } from '#/lib/api'
import { toast } from 'sonner'
import { UserAvatar } from './UserAvatar'

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  switchConversation: (id: string) => Promise<void>
  setShowMobileChat: (show: boolean) => void
}

export function NewChatDialog({
  open,
  onOpenChange,
  switchConversation,
  setShowMobileChat,
}: NewChatDialogProps) {
  const queryClient = useQueryClient()
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<any[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced user search
  useEffect(() => {
    if (!open) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsSearchingUsers(true)
    timerRef.current = setTimeout(async () => {
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
  }, [userSearch, open])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setUserSearch('')
      setUserResults([])
    }
  }, [open])

  const handleStartChat = async (targetUserId: string, targetName: string) => {
    setStartingChatWith(targetUserId)
    try {
      const res = await apiClient.post('/chat/conversations', { targetUserId })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      onOpenChange(false)
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
          className={cn(
            'px-6',
            'pt-6',
            'pb-4',
            'border-b',
            'border-border/30',
          )}
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
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className={cn('px-4', 'pt-4')}>
          <div className="relative">
            <Search
              size={13}
              className={cn('absolute', 'left-3', 'top-[13px]', 'text-muted-dark')}
            />
            <Input
              autoFocus
              placeholder="Search by name..."
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
            <div
              className={cn(
                'flex',
                'items-center',
                'justify-center',
                'py-8',
              )}
            >
              <Loader2 size={18} className={cn('animate-spin', 'text-primary')} />
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
              <p
                className={cn(
                  'text-[11px]',
                  'font-bold',
                  'text-muted-dark',
                )}
              >
                {userSearch ? 'No users found' : 'Start typing to search users'}
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
                  isOnline={u.isOnline}
                  size="sm"
                />
                <div className={cn('flex-1', 'min-w-0', 'text-left')}>
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
                  <p
                    className={cn(
                      'text-[9px]',
                      'font-bold',
                      'text-muted-dark',
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
                      'text-primary',
                      'shrink-0',
                    )}
                  />
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
                    Chat
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
