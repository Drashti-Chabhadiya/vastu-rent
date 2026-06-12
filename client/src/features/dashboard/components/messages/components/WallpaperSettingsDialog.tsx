import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Palette } from 'lucide-react'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { useChatStore } from '../../../../../store/useChatStore'

interface WallpaperSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WallpaperSettingsDialog({
  open,
  onOpenChange,
}: WallpaperSettingsDialogProps) {
  const {
    conversations,
    activeConversationId,
    updateConversationSettings,
    chatWallpaper,
    setChatWallpaper,
    currentUserId,
  } = useChatStore()

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )
  if (!activeConversation) return null

  const activeConversationSettings =
    activeConversation?.settings?.[currentUserId || '']
  const currentWallpaper =
    activeConversationSettings?.wallpaper ?? chatWallpaper

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200/80 shadow-2xl bg-card">
        <DialogHeader className="pb-3 border-b border-border/20">
          <DialogTitle className="text-[15px] font-black text-slate-800 flex items-center gap-2">
            <Palette size={16} className="text-primary" />
            Select Chat Wallpaper
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            {
              id: 'classic',
              name: 'Classic Sage',
              preview: 'bg-emerald-50/80 border-emerald-200',
            },
            {
              id: 'dawn',
              name: 'Dawn Peach',
              preview: 'bg-orange-50/80 border-orange-200',
            },
            {
              id: 'forest',
              name: 'Forest Green',
              preview: 'bg-emerald-100/80 border-emerald-300',
            },
            {
              id: 'minimal',
              name: 'Minimal Slate',
              preview: 'bg-slate-50/80 border-slate-200',
            },
          ].map((theme) => {
            const isActive = currentWallpaper === theme.id
            return (
              <button
                key={theme.id}
                onClick={async () => {
                  try {
                    await updateConversationSettings({
                      conversationId: activeConversation.id,
                      settings: { wallpaper: theme.id },
                    })
                    setChatWallpaper(theme.id)
                    toast.success(`Wallpaper updated to: ${theme.name}`)
                  } catch {
                    toast.error('Failed to update wallpaper setting')
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer',
                  isActive
                    ? 'border-emerald-600 bg-emerald-50/20'
                    : 'border-slate-200 hover:bg-slate-50',
                )}
              >
                <div
                  className={cn('w-full h-12 rounded-lg border', theme.preview)}
                />
                <span className="text-[11px] font-bold text-slate-700">
                  {theme.name}
                </span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
