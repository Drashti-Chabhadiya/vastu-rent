import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { FileText, Download } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useChatStore } from '../../../../../store/useChatStore'
import { isImageUrl, isAudioUrl } from '#/lib/chat-utils'

interface SharedFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SharedFilesDialog({
  open,
  onOpenChange,
}: SharedFilesDialogProps) {
  const { messages } = useChatStore()

  const fileAttachments = messages
    .filter((m) => !m.isDeleted && m.attachments && m.attachments.length > 0)
    .flatMap((m) =>
      m.attachments
        .filter((url) => !isImageUrl(url) && !isAudioUrl(url))
        .map((url) => ({
          url,
          senderName: m.sender.name,
          createdAt: new Date(m.createdAt),
          messageId: m.id,
        })),
    )

  const handleScrollToMsg = (msgId: string) => {
    window.dispatchEvent(
      new CustomEvent('scroll-to-chat-msg', { detail: { messageId: msgId } }),
    )
    toast.success('Scrolled to message')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200/80 shadow-2xl bg-card max-h-[70vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-border/20">
          <DialogTitle className="text-[15px] font-black text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            Shared Files ({fileAttachments.length})
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 scrollbar-thin min-h-[150px]">
          {fileAttachments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-[11px] font-bold">
              No shared files in this conversation.
            </div>
          ) : (
            fileAttachments.map((file, idx) => {
              const filename = decodeURIComponent(
                file.url.substring(file.url.lastIndexOf('/') + 1),
              ).split('?')[0]
              return (
                <div
                  key={`${file.messageId}-${idx}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-slate-100/50 transition-colors"
                >
                  <div
                    onClick={() => handleScrollToMsg(file.messageId)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    title="Click to view in chat"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-soft/30 text-primary flex items-center justify-center shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] font-bold text-slate-700 truncate">
                        {filename}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Sent by {file.senderName} on{' '}
                        {format(file.createdAt, 'dd MMM')}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors shrink-0 ml-2"
                    title="Download"
                  >
                    <Download size={13} />
                  </a>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
