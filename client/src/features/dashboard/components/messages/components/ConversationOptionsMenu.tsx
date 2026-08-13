import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu'
import { MoreVertical, Search } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useChatStore } from '../../../../../store/useChatStore'
import { useDeleteConversation, useIsMobile } from '#/hook'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

/**
 * A dropdown menu providing common actions for a conversation.
 */
export function ConversationOptionsMenu() {
  const navigate = useNavigate()
  const deleteConversation = useDeleteConversation()
  const isMobile = useIsMobile()

  const {
    conversations,
    activeConversationId,
    archiveConversation,
    unarchiveConversation,
    hideMedia,
    setHideMedia,
    setRevealedMediaMsgs,
    isMultiSelectMode,
    setIsMultiSelectMode,
    setSelectedMsgIds,
    setShowMediaBrowser,
    switchConversation,
    setShowMobileChat,
    showConversationSearch,
    setShowConversationSearch,
    setSearchText,
    setCurrentMatchIndex,
  } = useChatStore()

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )

  if (!activeConversation) return null

  const isArchived = activeConversation.isArchived

  const handleViewProfile = () => {
    navigate({
      to: '/users/$id',
      params: { id: activeConversation.otherParticipant.id },
    })
  }

  const handleToggleHideMedia = () => {
    setHideMedia(!hideMedia)
    setRevealedMediaMsgs([])
  }

  const handleToggleSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode)
    setSelectedMsgIds([])
  }

  const handleShowSharedMedia = () => {
    setShowMediaBrowser(true)
  }

  const handleSearch = () => {
    setShowConversationSearch(!showConversationSearch)
    if (showConversationSearch) {
      setSearchText('')
      setCurrentMatchIndex(0)
    }
  }

  const handleArchive = async () => {
    try {
      if (isArchived) {
        await unarchiveConversation(activeConversation.id)
        toast.success('Conversation unarchived')
      } else {
        await archiveConversation(activeConversation.id)
        toast.success('Conversation archived')
      }
    } catch {
      toast.error('Unable to update archive status')
    }
  }

  const handleClearChat = () => {
    window.dispatchEvent(new CustomEvent('open-clear-chat-dialog'))
  }

  const handleDelete = async () => {
    try {
      const id = activeConversation.id
      await deleteConversation.mutateAsync(id)
      toast.success('Conversation deleted')
      setShowMobileChat(false)
      switchConversation(null)
    } catch {
      toast.error('Failed to delete conversation')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
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
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className={cn('w-52')}>
        <DropdownMenuItem onSelect={handleViewProfile}>
          View Profile
        </DropdownMenuItem>
        {isMobile && (
          <DropdownMenuItem onSelect={handleSearch}>
            <Search size={14} className="mr-2" />
            {showConversationSearch ? 'Close Search' : 'Search in Chat'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handleToggleHideMedia}>
          {hideMedia ? 'Show Media' : 'Hide Media'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleToggleSelectMode}>
          {isMultiSelectMode ? 'Exit Select Mode' : 'Select Messages'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleShowSharedMedia}>
          Shared Media Browser
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleArchive}>
          {isArchived ? 'Unarchive Conversation' : 'Archive Conversation'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleClearChat}>
          Clear Chat
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleDelete} className="text-destructive">
          Delete Conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
