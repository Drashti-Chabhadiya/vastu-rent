import { useState, useEffect } from 'react'
import {
  X,
  FileText,
  ChevronRight,
  Info,
  Pencil,
  Image,
  Pin,
  MapPin,
  Volume2,
  Search,
  Star,
  Ban,
  AlertTriangle,
  Clock,
  Palette,
  FileDown,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { authClient } from '#/lib/auth/auth-client'
import { useChatStore } from '../../../../../store/useChatStore'
import { toast } from 'sonner'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { MediaBrowserDialog } from './MediaBrowserDialog'
import { DisappearingSettingsDialog } from './DisappearingSettingsDialog'
import { EncryptionSecurityDialog } from './EncryptionSecurityDialog'
import { WallpaperSettingsDialog } from './WallpaperSettingsDialog'
import { StarredMessagesDialog } from './StarredMessagesDialog'
import { SharedFilesDialog } from './SharedFilesDialog'
import { formatLastActive, isImageUrl, isAudioUrl } from '#/lib/chat-utils'
import { format } from 'date-fns'

export function AboutPanel() {
  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false

  const {
    conversations,
    activeConversationId,
    messages,
    currentUserId,
    checkOnline,
    toggleMuteConversation,
    clearChat: onClearChat,
    openLightbox,
    setShowDetailsPanel,
    setShowConversationSearch,
    setDisappearingMessages,
    chatWallpaper,
  } = useChatStore()

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showReportConfirm, setShowReportConfirm] = useState(false)

  const [showMediaBrowser, setShowMediaBrowser] = useState(false)
  const [showStarredDialog, setShowStarredDialog] = useState(false)
  const [showFilesDialog, setShowFilesDialog] = useState(false)
  const [showDisappearingDialog, setShowDisappearingDialog] = useState(false)
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false)
  const [showWallpaperDialog, setShowWallpaperDialog] = useState(false)

  // Local state for interactive editing of About section
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [aboutText, setAboutText] = useState('')

  // Derive active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null

  const activeConversationSettings = activeConversation?.settings?.[currentUserId || '']
  const currentWallpaper = activeConversationSettings?.wallpaper ?? chatWallpaper

  // Initialize about text when conversation changes
  useEffect(() => {
    if (activeConversation) {
      setAboutText((activeConversation.otherParticipant as any).about || 'Helping you find the perfect home aligned with Vastu.')
    }
    setIsEditingAbout(false)
  }, [activeConversationId])

  if (!activeConversation) return null

  const otherPersonOnline = checkOnline(activeConversation.otherParticipant.id)
  const canSeeStatus =
    myShowOnline &&
    activeConversation.otherParticipant.lastActive !== null &&
    activeConversation.otherParticipant.lastActive !== undefined
  const showOnlineStatus = canSeeStatus && otherPersonOnline

  // Attachments calculations
  const mediaAttachments = messages
    .flatMap((m) => m.attachments || [])
    .filter(isImageUrl)

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

  // Starred messages calculation
  const starredMessages = messages.filter(
    (m) => !m.isDeleted && m.starredBy?.includes(currentUserId || ''),
  )

  // Pinned messages calculation
  const pinnedMessages = messages.filter(
    (m) => !m.isDeleted && m.pinnedBy && m.pinnedBy.length > 0,
  )
  const lastPinnedMessage = pinnedMessages[pinnedMessages.length - 1] || null

  const handleClearChat = async () => {
    try {
      await onClearChat(activeConversation.id)
      toast.success('Chat cleared')
    } catch {
      toast.error('Failed to clear chat')
    } finally {
      setShowClearConfirm(false)
    }
  }

  const handleBlockUser = () => {
    toast.error(`Blocked ${activeConversation.otherParticipant.name}`)
    setShowBlockConfirm(false)
  }

  const handleReportUser = () => {
    toast.warning(`Reported ${activeConversation.otherParticipant.name}`)
    setShowReportConfirm(false)
  }

  const handleScrollToMsg = (msgId: string) => {
    window.dispatchEvent(new CustomEvent('scroll-to-chat-msg', { detail: { messageId: msgId } }))
    toast.success('Scrolled to message')
    setShowStarredDialog(false)
    setShowFilesDialog(false)
  }

  const handleSaveAbout = () => {
    ; (activeConversation.otherParticipant as any).about = aboutText
    setIsEditingAbout(false)
    toast.success('About section updated')
  }

  // Export Chat helper
  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.info('No messages to export')
      return
    }
    const txtContent = messages
      .map((m) => {
        const dateStr = format(new Date(m.createdAt), 'yyyy-MM-dd HH:mm:ss')
        return `[${dateStr}] ${m.sender.name}: ${m.content}`
      })
      .join('\n')

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chat-history-${activeConversation.otherParticipant.name.toLowerCase().replace(/\s+/g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Chat history exported successfully!')
  }

  // Disappearing messages duration labels
  const getDisappearingLabel = (sec: number) => {
    if (!sec || sec === 0) return 'Off'
    if (sec === 86400) return '24 Hours'
    if (sec === 604800) return '7 Days'
    if (sec === 7776000) return '90 Days'
    return `${sec / 86400} Days`
  }

  return (
    <div className="w-[320px] shrink-0 bg-[#fbf9f4] border-l border-slate-200/80 flex flex-col h-full overflow-hidden select-none animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0">
        <h3 className="text-[16px] font-bold text-slate-800">
          Chat Info
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDetailsPanel(false)}
          className="h-8 w-8 rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-700 cursor-pointer shadow-none shrink-0"
        >
          <X size={16} strokeWidth={2.5} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-6 flex flex-col gap-4">
        {/* Profile Info Card Section */}
        <div className="flex items-center gap-4 bg-transparent py-2 px-1">
          {/* Custom avatar badge wrapper */}
          <div className="relative shrink-0 w-20 h-20">
            {activeConversation.otherParticipant.image ? (
              <img
                src={activeConversation.otherParticipant.image}
                alt={activeConversation.otherParticipant.name}
                className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-300 flex items-center justify-center text-xl font-bold text-slate-700 border border-slate-200 shadow-sm">
                {activeConversation.otherParticipant.name.trim().charAt(0).toUpperCase()}
              </div>
            )}
            {showOnlineStatus && (
              <div className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-emerald-500 rounded-full border-3 border-white shadow-xs" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-[16px] font-bold text-slate-800 leading-tight">
                {activeConversation.otherParticipant.name}
              </h4>
              <Star size={14} className="text-emerald-600 fill-emerald-600 shrink-0" />
            </div>

            <div className="flex flex-col mt-1">
              {showOnlineStatus ? (
                <span className="text-[12px] font-bold text-emerald-600">Online</span>
              ) : (
                <span className="text-[12px] font-semibold text-slate-400">Offline</span>
              )}
              <span className="text-[11px] text-slate-400 mt-0.5">
                {showOnlineStatus
                  ? 'Last seen just now'
                  : (() => {
                    const formatted = formatLastActive(activeConversation.otherParticipant.lastActive)
                    return formatted === 'Offline' ? 'Offline' : `Last seen ${formatted}`
                  })()}
              </span>
            </div>
          </div>
        </div>

        {/* About Card block */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex gap-3.5 items-start">
          <div className="w-9 h-9 rounded-xl bg-slate-100/80 text-slate-600 flex items-center justify-center shrink-0">
            <Info size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-slate-800">About</h4>
            {isEditingAbout ? (
              <div className="mt-2 flex flex-col gap-2">
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full text-[12px] p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none h-16 text-foreground bg-slate-50 font-bold"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAboutText((activeConversation.otherParticipant as any).about || 'Helping you find the perfect home aligned with Vastu.')
                      setIsEditingAbout(false)
                    }}
                    className="h-6 px-2 text-[9px] font-black text-slate-500 rounded-md hover:bg-slate-100 cursor-pointer shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAbout}
                    className="h-6 px-2.5 text-[9px] font-black text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm cursor-pointer"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {aboutText}
              </p>
            )}
          </div>
          {!isEditingAbout && (
            <button
              onClick={() => setIsEditingAbout(true)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100/50 shrink-0 border-none bg-transparent cursor-pointer"
              title="Edit about"
            >
              <Pencil size={15} />
            </button>
          )}
        </div>

        {/* Media, Links and Docs Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowMediaBrowser(true)}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100/80 text-slate-600 flex items-center justify-center shrink-0">
                <Image size={18} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">
                Media, Links and Docs
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors">
              <span className="text-[12px] font-bold">
                {mediaAttachments.length}
              </span>
              <ChevronRight size={15} />
            </div>
          </div>

          {mediaAttachments.length > 0 ? (
            <div className="grid grid-cols-5 gap-2 mt-1">
              {mediaAttachments.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openLightbox(mediaAttachments, i)}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-pointer outline-none bg-slate-50 hover:opacity-95 transition-opacity"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {mediaAttachments.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowMediaBrowser(true)}
                  className="aspect-square rounded-xl bg-[#d2ebd4] hover:bg-[#c3e3c6] text-emerald-800 text-[12px] font-bold flex items-center justify-center cursor-pointer border-none transition-colors"
                >
                  +{mediaAttachments.length - 4}
                </button>
              )}
            </div>
          ) : (
            <div className="text-[12px] text-slate-400 py-1 px-1 select-none font-medium italic">
              No media shared
            </div>
          )}
        </div>

        {/* Pinned Messages Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between cursor-pointer group" onClick={() => toast.info('Pinned Messages options in options menu')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100/80 text-slate-600 flex items-center justify-center shrink-0">
                <Pin size={18} className="rotate-45" />
              </div>
              <span className="text-[13px] font-bold text-slate-800">
                Pinned Messages
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors">
              <span className="text-[12px] font-bold">{pinnedMessages.length}</span>
              <ChevronRight size={15} />
            </div>
          </div>

          <div
            onClick={() => {
              if (lastPinnedMessage) {
                handleScrollToMsg(lastPinnedMessage.id)
              } else {
                toast.info('No pinned messages in this chat')
              }
            }}
            className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
            title="Click to scroll to pinned message"
          >
            <p className={cn(
              "text-[11.5px] leading-normal truncate flex-1 pr-3 font-semibold",
              lastPinnedMessage ? "text-slate-600" : "text-slate-400 italic"
            )}>
              {lastPinnedMessage ? lastPinnedMessage.content : 'No pinned messages'}
            </p>
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <MapPin size={13} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* Settings List Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col gap-1">
          {/* Row 1: Mute Notifications */}
          <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Volume2 size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium text-slate-700">Mute Notifications</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await toggleMuteConversation(activeConversation.id)
                  toast.success('Mute setting updated')
                } catch {
                  toast.error('Failed to update mute setting')
                }
              }}
              className={cn(
                'w-8 h-4 rounded-full transition-colors relative cursor-pointer focus:outline-none shrink-0 border-none outline-none',
                activeConversation.mutedBy?.includes(currentUserId!)
                  ? 'bg-[#0a6634]'
                  : 'bg-slate-200',
              )}
            >
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-full bg-white absolute top-[1px] shadow-sm transition-transform duration-200',
                  activeConversation.mutedBy?.includes(currentUserId!)
                    ? 'translate-x-4'
                    : 'translate-x-[1px]',
                )}
              />
            </button>
          </div>

          {/* Row 2: Search in Conversation */}
          <div
            onClick={() => {
              setShowConversationSearch(true)
              toast.info('Search in conversation opened')
            }}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Search size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium text-slate-700">Search in Conversation</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </div>

          {/* Row 3: Disappearing Messages */}
          <div
            onClick={() => setShowDisappearingDialog(true)}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium text-slate-700">Disappearing Messages</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[11px] font-bold text-slate-500/80">
                {getDisappearingLabel(activeConversation.disappearingDuration || 0)}
              </span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Row 4: Encryption & Security */}
          <div
            onClick={() => setShowEncryptionInfo(true)}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium text-slate-700">Encryption & Security</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[10px] font-bold text-slate-500/70">Encrypted</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Row 5: Chat Wallpaper */}
          <div
            onClick={() => setShowWallpaperDialog(true)}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Palette size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium text-slate-700">Chat Wallpaper</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[10px] font-bold text-slate-500/70 uppercase tracking-wider">{currentWallpaper}</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Row 6: Starred Messages */}
          <div
            onClick={() => setShowStarredDialog(true)}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Star size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium text-slate-700">Starred Messages</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[11px] font-medium">{starredMessages.length}</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Row 7: Files and Documents */}
          <div
            onClick={() => setShowFilesDialog(true)}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-slate-500" />
              <span className="text-[12px] font-medium text-slate-700">Files and Documents</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[11px] font-medium">{fileAttachments.length}</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Row 8: Export Chat */}
          <div
            onClick={handleExportChat}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-[#0a6634]"
          >
            <div className="flex items-center gap-3">
              <FileDown size={16} className="text-[#0a6634]" />
              <span className="text-[12px] font-bold">Export Chat History</span>
            </div>
            <ChevronRight size={14} className="text-[#0a6634]/60" />
          </div>
        </div>

        {/* Destructive actions blocks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-1 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setShowBlockConfirm(true)}
            className="flex items-center gap-3 p-3 rounded-xl text-[12px] font-bold text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer w-full text-left outline-none border-none bg-transparent"
          >
            <Ban size={16} className="text-red-500" />
            <span>Block {activeConversation.otherParticipant.name}</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-1 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setShowReportConfirm(true)}
            className="flex items-center gap-3 p-3 rounded-xl text-[12px] font-bold text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer w-full text-left outline-none border-none bg-transparent"
          >
            <AlertTriangle size={16} className="text-red-500" />
            <span>Report {activeConversation.otherParticipant.name}</span>
          </button>
        </div>
      </div>

      {/* Extracted dialog components */}
      <DisappearingSettingsDialog
        open={showDisappearingDialog}
        onOpenChange={setShowDisappearingDialog}
        currentDuration={activeConversation.disappearingDuration || 0}
        onSetDuration={async (duration: number) => {
          await setDisappearingMessages(activeConversation.id, duration)
          toast.success(`Disappearing messages set to: ${getDisappearingLabel(duration)}`)
        }}
      />

      <EncryptionSecurityDialog open={showEncryptionInfo} onOpenChange={setShowEncryptionInfo} />
      <WallpaperSettingsDialog open={showWallpaperDialog} onOpenChange={setShowWallpaperDialog} />
      <StarredMessagesDialog open={showStarredDialog} onOpenChange={setShowStarredDialog} />
      <SharedFilesDialog open={showFilesDialog} onOpenChange={setShowFilesDialog} />

      <ReusableAlertDialog
        isOpen={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClearChat}
        title="Clear Chat?"
        description="Are you sure you want to clear this chat? This action cannot be undone."
        confirmText="Clear"
        variant="danger"
      />

      <ReusableAlertDialog
        isOpen={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        onConfirm={handleBlockUser}
        title={`Block ${activeConversation.otherParticipant.name}?`}
        description={`Are you sure you want to block ${activeConversation.otherParticipant.name}? You will no longer receive their messages.`}
        confirmText="Block"
        variant="danger"
      />

      <ReusableAlertDialog
        isOpen={showReportConfirm}
        onOpenChange={setShowReportConfirm}
        onConfirm={handleReportUser}
        title={`Report ${activeConversation.otherParticipant.name}?`}
        description={`Report ${activeConversation.otherParticipant.name} for spam or inappropriate behavior? This report will be reviewed by admin.`}
        confirmText="Report"
        variant="danger"
      />

      <MediaBrowserDialog
        open={showMediaBrowser}
        onOpenChange={setShowMediaBrowser}
        messages={messages}
      />
    </div>
  )
}
