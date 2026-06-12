import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Image, Download, User, Calendar } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { Message } from '../../../../../hook/use-chat'
import { format } from 'date-fns'

interface MediaBrowserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: Message[]
}

export function MediaBrowserDialog({
  open,
  onOpenChange,
  messages,
}: MediaBrowserDialogProps) {
  // Filter all media files (attachments) that are images
  const isImageUrl = (url: string): boolean => {
    const cleanUrl = url.split('?')[0].toLowerCase()
    return (
      cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.gif') ||
      cleanUrl.endsWith('.webp')
    )
  }

  const mediaItems = messages
    .filter((m) => !m.isDeleted && m.attachments && m.attachments.length > 0)
    .flatMap((m) =>
      m.attachments
        .filter(isImageUrl)
        .map((url) => ({
          url,
          senderName: m.sender.name,
          createdAt: new Date(m.createdAt),
          messageId: m.id,
        })),
    )

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `vastu-media-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Failed to download image:', err)
      // Fallback: open in new tab
      window.open(url, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-2xl',
          'rounded-3xl',
          'p-0',
          'overflow-hidden',
          'border-border/30',
          'shadow-2xl',
          'flex flex-col',
          'max-h-[80vh]',
        )}
      >
        <DialogHeader
          className={cn(
            'px-6',
            'pt-6',
            'pb-4',
            'border-b',
            'border-border/30',
            'flex flex-row items-center justify-between',
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
            <Image size={18} className="text-primary" />
            Shared Media ({mediaItems.length})
          </DialogTitle>
        </DialogHeader>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin min-h-[250px]">
          {mediaItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted-light flex items-center justify-center text-muted-dark">
                <Image size={20} />
              </div>
              <p className="text-[11px] font-bold text-muted-dark">
                No media shared in this chat yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaItems.map((item, index) => (
                <div
                  key={`${item.messageId}-${index}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-border/20 shadow-sm bg-muted-light"
                >
                  <img
                    src={item.url}
                    alt={`Shared Media ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                  />

                  {/* Actions & info overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 text-white">
                    <div className="flex justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDownload(item.url, index)}
                        className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-lg hover:text-white cursor-pointer"
                        title="Download"
                      >
                        <Download size={13} />
                      </Button>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1 text-[8.5px] font-extrabold truncate">
                        <User size={10} className="shrink-0 opacity-80" />
                        <span>{item.senderName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[8px] font-bold opacity-80 truncate">
                        <Calendar size={10} className="shrink-0" />
                        <span>{format(item.createdAt, 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
