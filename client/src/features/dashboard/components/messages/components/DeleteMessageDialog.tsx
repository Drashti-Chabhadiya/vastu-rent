import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { toast } from 'sonner'
import { useChatStore } from '../../../../../store/useChatStore'

export function DeleteMessageDialog() {
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    canDeleteForEveryone,
    deleteTargetId,
    setDeleteTargetId,
    deleteMessage,
  } = useChatStore()

  const handleDeleteConfirm = async (mode: 'me' | 'everyone') => {
    if (!deleteTargetId) return
    try {
      await deleteMessage({ messageId: deleteTargetId, mode })
      setShowDeleteDialog(false)
      setDeleteTargetId(null)
      toast.success(
        mode === 'everyone'
          ? 'Message deleted for everyone'
          : 'Message deleted for you',
      )
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete message')
    }
  }

  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="max-w-xs rounded-3xl p-5 border border-border/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-black text-foreground text-center">
            Delete Message?
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2.5 mt-3">
          <Button
            onClick={() => handleDeleteConfirm('me')}
            className="w-full text-[11px] font-bold h-9 rounded-xl border border-border/30 hover:bg-muted-light cursor-pointer shadow-none"
            variant="ghost"
          >
            Delete for me
          </Button>
          {canDeleteForEveryone && (
            <Button
              onClick={() => handleDeleteConfirm('everyone')}
              className="w-full text-[11px] font-bold h-9 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer shadow-sm"
            >
              Delete for everyone
            </Button>
          )}
          <Button
            onClick={() => {
              setShowDeleteDialog(false)
              setDeleteTargetId(null)
            }}
            className="w-full text-[11px] font-bold h-9 hover:bg-muted/40 cursor-pointer shadow-none text-muted-dark"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
