import { Button } from '#/components/ui/button'
import { X, Star, Copy, Forward, Trash2 } from 'lucide-react'
import { useChatStore } from '../../../../../store/useChatStore'
import { toast } from 'sonner'
import { parseMessage } from '#/lib/chat-utils'
import { format } from 'date-fns'

export function MultiSelectBar() {
  const {
    selectedMsgIds,
    setSelectedMsgIds,
    setIsMultiSelectMode,
    messages,
    toggleStarMessage,
    deleteMessage,
    setForwardTargetId,
    setShowForwardDialog,
  } = useChatStore()

  const handleBulkStar = async () => {
    if (selectedMsgIds.length === 0) return
    try {
      await Promise.all(selectedMsgIds.map((id) => toggleStarMessage(id)))
      toast.success('Messages starred status updated')
      setSelectedMsgIds([])
      setIsMultiSelectMode(false)
    } catch {
      toast.error('Failed to star messages')
    }
  }

  const handleBulkCopy = () => {
    if (selectedMsgIds.length === 0) return
    const textToCopy = messages
      .filter((m) => selectedMsgIds.includes(m.id))
      .map((m) => {
        const { text } = parseMessage(m.content)
        return `[${format(new Date(m.createdAt), 'HH:mm')}] ${m.sender.name}: ${text}`
      })
      .join('\n')
    navigator.clipboard.writeText(textToCopy)
    toast.success('Copied selected messages to clipboard!')
    setSelectedMsgIds([])
    setIsMultiSelectMode(false)
  }

  const handleBulkDelete = async () => {
    if (selectedMsgIds.length === 0) return
    if (!confirm(`Are you sure you want to delete these ${selectedMsgIds.length} messages for you?`)) return
    try {
      await Promise.all(selectedMsgIds.map((id) => deleteMessage({ messageId: id, mode: 'me' })))
      toast.success('Messages deleted')
      setSelectedMsgIds([])
      setIsMultiSelectMode(false)
    } catch {
      toast.error('Failed to delete messages')
    }
  }

  const handleBulkForward = () => {
    if (selectedMsgIds.length === 0) return
    setForwardTargetId(selectedMsgIds)
    setShowForwardDialog(true)
  }

  return (
    <div className="px-6 py-3 border-b border-border/20 bg-primary/5 flex items-center justify-between gap-4 shrink-0 animate-in slide-in-from-top duration-250">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsMultiSelectMode(false)
            setSelectedMsgIds([])
          }}
          className="w-7 h-7 rounded-full hover:bg-muted-light text-muted-dark hover:text-foreground cursor-pointer"
        >
          <X size={14} />
        </Button>
        <span className="text-[12px] font-black text-primary">
          {selectedMsgIds.length} message{selectedMsgIds.length !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleBulkStar}
          disabled={selectedMsgIds.length === 0}
          variant="ghost"
          className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-primary/10 text-primary cursor-pointer border border-primary/20"
        >
          <Star size={12} className="fill-transparent" />
          Star/Unstar
        </Button>
        <Button
          onClick={handleBulkCopy}
          disabled={selectedMsgIds.length === 0}
          variant="ghost"
          className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-primary/10 text-primary cursor-pointer border border-primary/20"
        >
          <Copy size={12} />
          Copy
        </Button>
        <Button
          onClick={handleBulkForward}
          disabled={selectedMsgIds.length === 0}
          variant="ghost"
          className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-primary/10 text-primary cursor-pointer border border-primary/20"
        >
          <Forward size={12} />
          Forward
        </Button>
        <Button
          onClick={handleBulkDelete}
          disabled={selectedMsgIds.length === 0}
          variant="ghost"
          className="h-8 rounded-xl text-[10px] font-black px-3 gap-1.5 hover:bg-red-50 text-red-600 cursor-pointer border border-red-200"
        >
          <Trash2 size={12} />
          Delete
        </Button>
      </div>
    </div>
  )
}

