import { useState } from 'react'
import {
  FileText,
  ChevronRight,
  Pin,
  Star,
  Volume2,
  Palette,
  FileDown,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { useChatStore } from '../../../../../../store/useChatStore'
import { isImageUrl, isAudioUrl } from '#/lib/chat-utils'

// Dialogs
import { StarredMessagesDialog } from '../StarredMessagesDialog'
import { WallpaperSettingsDialog } from '../WallpaperSettingsDialog'
import { SharedFilesDialog } from '../SharedFilesDialog'

interface AboutActionsCardProps {
  activeConversation: any
}

export function AboutActionsCard({
  activeConversation,
}: AboutActionsCardProps) {
  const {
    messages,
    currentUserId,
    toggleMuteConversation,
    chatWallpaper,
    setShowMediaBrowser,
  } = useChatStore()

  const [showStarredDialog, setShowStarredDialog] = useState(false)
  const [showFilesDialog, setShowFilesDialog] = useState(false)
  const [showWallpaperDialog, setShowWallpaperDialog] = useState(false)

  // Attachments calculations
  const mediaAttachments = messages
    .flatMap((m: any) => m.attachments || [])
    .filter(isImageUrl)

  const fileAttachments = messages
    .filter(
      (m: any) => !m.isDeleted && m.attachments && m.attachments.length > 0,
    )
    .flatMap((m: any) =>
      m.attachments
        .filter((url: string) => !isImageUrl(url) && !isAudioUrl(url))
        .map((url: string) => ({
          url,
          senderName: m.sender.name,
          createdAt: new Date(m.createdAt),
          messageId: m.id,
        })),
    )

  // Starred messages calculation
  const starredMessages = messages.filter(
    (m: any) => !m.isDeleted && m.starredBy?.includes(currentUserId || ''),
  )

  // Pinned messages calculation
  const pinnedMessages = messages.filter(
    (m: any) => !m.isDeleted && m.pinnedBy && m.pinnedBy.length > 0,
  )
  const lastPinnedMessage = pinnedMessages[pinnedMessages.length - 1] || null

  const activeConversationSettings =
    activeConversation?.settings?.[currentUserId || '']
  const currentWallpaper =
    activeConversationSettings?.wallpaper ?? chatWallpaper

  const isMuted = activeConversation.mutedBy?.includes(currentUserId || '')

  const handleScrollToMsg = (msgId: string) => {
    window.dispatchEvent(
      new CustomEvent('scroll-to-chat-msg', { detail: { messageId: msgId } }),
    )
    toast.success('Scrolled to message')
    setShowStarredDialog(false)
    setShowFilesDialog(false)
  }

  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.info('No messages to export')
      return
    }
    const txtContent = messages
      .map((m: any) => {
        const dateStr = format(new Date(m.createdAt), 'yyyy-MM-dd HH:mm:ss')
        return `[${dateStr}] ${m.sender.name}: ${m.content}`
      })
      .join('\n')

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chat-history-${activeConversation.otherParticipant.name
      .toLowerCase()
      .replace(/\s+/g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Chat history exported successfully!')
  }

  return (
    <>
      <div className="bg-white border border-slate-100 rounded-[2rem] p-1.5 shadow-2xs flex flex-col gap-0.5 shrink-0">
        {/* Media, links and docs */}
        <div
          onClick={() => {
            setShowMediaBrowser(true)
          }}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
              Media, links and docs
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0">
            <span className="text-[12px] font-bold text-slate-500/80">
              {mediaAttachments.length + fileAttachments.length}
            </span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Pinned Messages */}
        <div
          onClick={() => {
            if (lastPinnedMessage) {
              handleScrollToMsg(lastPinnedMessage.id)
            } else {
              toast.info('No pinned messages in this chat')
            }
          }}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border-t border-slate-50"
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <Pin size={16} />
            </div>
            <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
              Pinned messages
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0">
            <span className="text-[12px] font-bold text-slate-500/80">
              {pinnedMessages.length}
            </span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Starred Messages */}
        <div
          onClick={() => setShowStarredDialog(true)}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border-t border-slate-50"
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <Star size={16} />
            </div>
            <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
              Starred messages
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0">
            <span className="text-[12px] font-bold text-slate-500/80">
              {starredMessages.length}
            </span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Notifications */}
        <div
          onClick={async () => {
            try {
              await toggleMuteConversation(activeConversation.id)
              toast.success('Mute settings updated')
            } catch {
              toast.error('Failed to update mute settings')
            }
          }}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border-t border-slate-50"
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <Volume2 size={16} />
            </div>
            <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
              Notifications
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0">
            <span
              className={cn(
                'text-[12px] font-bold',
                isMuted ? 'text-slate-400' : 'text-emerald-600',
              )}
            >
              {isMuted ? 'Muted' : 'On'}
            </span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Chat Wallpaper */}
        <div
          onClick={() => setShowWallpaperDialog(true)}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border-t border-slate-50"
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <Palette size={16} />
            </div>
            <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
              Chat Wallpaper
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-500/80 uppercase tracking-wider">
              {currentWallpaper}
            </span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Export Chat History */}
        <div
          onClick={handleExportChat}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border-t border-slate-50"
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-green-tint text-brand-primary-deep flex items-center justify-center shrink-0">
              <FileDown size={16} />
            </div>
            <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
              Export Chat History
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      <WallpaperSettingsDialog
        open={showWallpaperDialog}
        onOpenChange={setShowWallpaperDialog}
      />
      <StarredMessagesDialog
        open={showStarredDialog}
        onOpenChange={setShowStarredDialog}
      />
      <SharedFilesDialog
        open={showFilesDialog}
        onOpenChange={setShowFilesDialog}
      />
    </>
  )
}
