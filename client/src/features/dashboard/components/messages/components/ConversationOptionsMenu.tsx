import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { cn } from '#/lib/utils'

/**
 * A dropdown menu providing common actions for a conversation.
 * Placeholder handlers are provided – replace with actual logic as needed.
 */
export function ConversationOptionsMenu({
  onViewProfile,
  onArchive,
  onClearChat,
  onDelete,
}: {
  onViewProfile?: () => void
  onArchive?: () => void
  onClearChat?: () => void
  onDelete?: () => void
}) {
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
      <DropdownMenuContent align="end" sideOffset={4} className={cn('w-48')}>
        <DropdownMenuItem onSelect={onViewProfile}>
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onArchive}>
          Archive Conversation
        </DropdownMenuItem>
        {onClearChat && (
          <DropdownMenuItem onSelect={onClearChat}>
            Clear Chat
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDelete} className="text-destructive">
          Delete Conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
