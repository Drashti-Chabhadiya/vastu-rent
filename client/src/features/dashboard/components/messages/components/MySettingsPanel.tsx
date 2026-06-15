import { useState, useRef, useEffect } from 'react'
import {
  X,
  Camera,
  Pencil,
  Check,
  User,
  Info,
  Shield,
  Bell,
  Wallpaper,
  HardDrive,
  Slash,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  KeyRound,
  MessageSquare,
  HelpCircle,
  UserPlus,
  Copy,
  Lock,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { UserAvatar } from './UserAvatar'
import { useChatStore } from '../../../../../store/useChatStore'
import { authClient } from '#/lib/auth/auth-client'
import { useUploadProfileImage, useUpdateUserSettings } from '#/hook'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'

type SubScreen =
  | 'main'
  | 'profile'
  | 'account'
  | 'privacy'
  | 'chats'
  | 'notifications'
  | 'storage'
  | 'help'
  | 'invite'

export function MySettingsPanel({
  isEmbedded = false,
  onBackToInfo,
}: {
  isEmbedded?: boolean
  onBackToInfo?: () => void
} = {}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sub-screen state
  const [subScreen, setSubScreen] = useState<SubScreen>('main')

  // Retrieve current session query
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  // Destructure zustand global state
  const {
    conversations,
    messages,
    currentUserId,
    setShowDetailsPanel,
    chatWallpaper,
    setChatWallpaper,
    hideMedia,
    setHideMedia,
    unblockConversation,
    setShowNewChat,
  } = useChatStore()

  // Mutations
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadProfileImage()
  const { mutateAsync: updateSettings } = useUpdateUserSettings()

  // Local state for editing Name & Bio
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioValue, setBioValue] = useState('')

  // Notifications (Local storage preferences)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const val = localStorage.getItem('chat_settings_notifications_sound')
    return val !== 'false'
  })
  const [desktopEnabled, setDesktopEnabled] = useState(() => {
    const val = localStorage.getItem('chat_settings_notifications_desktop')
    return val !== 'false'
  })

  // Invite state
  const [copiedLink, setCopiedLink] = useState(false)

  // Sync edited values when session query updates
  useEffect(() => {
    if (session?.user) {
      setNameValue(session.user.name || '')
      setBioValue(
        (session.user as any).bio || 'Hey there! I am using VastuRent.',
      )
    }
  }, [session])

  // Handle image select
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await uploadImage(file)
        await queryClient.invalidateQueries({ queryKey: ['session'] })
        toast.success('Profile avatar updated successfully!')
      } catch (err: any) {
        toast.error(err?.message || 'Failed to upload image')
      }
    }
  }

  // Save Name
  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    try {
      await authClient.updateUser({
        name: nameValue.trim(),
      })
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      setIsEditingName(false)
      toast.success('Username updated successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update username')
    }
  }

  // Save Bio/About
  const handleSaveBio = async () => {
    try {
      await updateSettings({
        bio: bioValue.trim(),
      })
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      setIsEditingBio(false)
      toast.success('About status updated!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update about status')
    }
  }

  // Sound notify toggle
  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked)
    localStorage.setItem('chat_settings_notifications_sound', String(checked))
    toast.success(`Sound notifications ${checked ? 'enabled' : 'disabled'}`)
  }

  // Desktop notify toggle
  const handleDesktopToggle = (checked: boolean) => {
    setDesktopEnabled(checked)
    localStorage.setItem('chat_settings_notifications_desktop', String(checked))
    toast.success(`Desktop notifications ${checked ? 'enabled' : 'disabled'}`)
  }

  // Wallpaper change
  const handleWallpaperChange = (themeName: string) => {
    setChatWallpaper(themeName)
    toast.success(`Theme set to ${themeName}`)
  }

  // Copy invitation link
  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://vasturent.com/invite')
    setCopiedLink(true)
    toast.success('Invitation link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Calculate storage consumption
  const getStorageStats = () => {
    let imageCount = 0
    let audioCount = 0
    let videoCount = 0
    let docCount = 0

    messages.forEach((msg) => {
      if (!msg.isDeleted && msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((url) => {
          if (url.match(/\.(jpeg|jpg|gif|png|webp)/i)) imageCount++
          else if (url.match(/\.(mp3|wav|ogg|m4a|weba)/i)) audioCount++
          else if (url.match(/\.(mp4|webm|mov|avi)/i)) videoCount++
          else docCount++
        })
      }
    })

    const mediaSize = imageCount * 0.45 + videoCount * 4.2
    const audioSize = audioCount * 0.75
    const docSize = docCount * 1.1
    const totalSize = parseFloat((mediaSize + audioSize + docSize).toFixed(2))
    const limitMB = 15360
    const usedPercent = Math.min(
      parseFloat(((totalSize / limitMB) * 100).toFixed(3)) + 0.05,
      100,
    )

    return {
      totalSize,
      mediaSize: parseFloat(mediaSize.toFixed(2)),
      audioSize: parseFloat(audioSize.toFixed(2)),
      docSize: parseFloat(docSize.toFixed(2)),
      imageCount,
      audioCount,
      videoCount,
      docCount,
      usedPercent,
    }
  }

  const storage = getStorageStats()

  // Filter blocked users
  const blockedConversations = conversations.filter((conv) =>
    conv.blockedBy?.includes(currentUserId || ''),
  )

  if (!session?.user) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-[#fbf9f4]',
          !isEmbedded
            ? 'w-[320px] shrink-0 border-l border-slate-200/80'
            : 'flex-1',
        )}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const user = session.user
  const myShowOnline = (user as any).showOnline !== false
  const myShowProfile = (user as any).showProfile !== false

  // Navigate back or collapse
  const handleBack = () => {
    if (subScreen === 'main') {
      if (isEmbedded) {
        onBackToInfo?.()
      } else {
        setShowDetailsPanel(false)
      }
    } else {
      setSubScreen('main')
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden select-none animate-in slide-in-from-right duration-250 bg-[#fbf9f4]',
        !isEmbedded && 'w-[320px] shrink-0 border-l border-slate-200/80',
      )}
    >
      {/* ── HEADER ── */}
      {(!isEmbedded || subScreen !== 'main') && (
        <div className="bg-[#0d4d38] px-4 py-5 flex items-center gap-4 text-white shrink-0 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8 rounded-full hover:bg-white/10 text-white cursor-pointer shadow-none shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </Button>
          <h3 className="text-[15px] font-bold text-white capitalize leading-none font-display">
            {subScreen === 'main'
              ? 'Settings'
              : subScreen === 'invite'
                ? 'Invite a friend'
                : subScreen === 'storage'
                  ? 'Storage and data'
                  : subScreen}
          </h3>
        </div>
      )}

      {/* ── SCROLLABLE VIEWS ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {/* ── 1. MAIN SCREEN VIEW ── */}
        {subScreen === 'main' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* User Profile Card */}
            <div
              onClick={() => setSubScreen('profile')}
              className="flex items-center gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-4 shadow-sm hover:bg-slate-50/70 transition-all cursor-pointer group"
            >
              <UserAvatar
                image={user.image}
                name={user.name}
                size="sidebar-large"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-black text-slate-800 group-hover:text-primary transition-colors truncate">
                  {user.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                  {bioValue}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
            </div>

            {/* Settings Options List */}
            <div className="bg-white/70 border border-slate-200/30 rounded-2xl overflow-hidden shadow-xs flex flex-col">
              {/* Account settings */}
              <button
                onClick={() => setSubScreen('account')}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <KeyRound size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 block">
                      Account
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Security notifications, login details
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>

              {/* Privacy settings */}
              <button
                onClick={() => setSubScreen('privacy')}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                    <Shield size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 block">
                      Privacy
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Blocked contacts, profile visibility
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>

              {/* Chats settings */}
              <button
                onClick={() => setSubScreen('chats')}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 block">
                      Chats
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Wallpaper themes, media visibility
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setSubScreen('notifications')}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                    <Bell size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 block">
                      Notifications
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Message alerts, audio tones
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>

              {/* Storage and data */}
              <button
                onClick={() => setSubScreen('storage')}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                    <HardDrive size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 block">
                      Storage and data
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Network usage, auto-download sizes
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>

              {/* Help Support */}
              <button
                onClick={() => setSubScreen('help')}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center shrink-0">
                    <HelpCircle size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 block">
                      Help
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Help centre, contact support chats
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>

              {/* Invite a friend */}
              <button
                onClick={() => setSubScreen('invite')}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                    <UserPlus size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 block">
                      Invite a friend
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Share referral link or codes
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* ── 2. PROFILE EDIT SUB-SCREEN ── */}
        {subScreen === 'profile' && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-right-5 duration-200">
            <div className="flex flex-col items-center gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
              {/* Avatar Upload Container */}
              <div
                className="relative group cursor-pointer"
                onClick={handleImageClick}
              >
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-slate-200/80 shadow-md flex items-center justify-center bg-slate-100">
                  {isUploadingImage ? (
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  ) : user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-slate-500 uppercase">
                      {user.name.charAt(0)}
                    </span>
                  )}
                  {/* Photo Change Indicator overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold tracking-wider">
                    <Camera size={18} className="mb-0.5" />
                    CHANGE
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Edit Username Field */}
              <div className="w-full space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={10} /> Profile Username
                </label>
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="h-8 text-[12px] font-bold px-2.5 rounded-lg border-slate-200 bg-white"
                      placeholder="Enter name..."
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <Button
                      onClick={handleSaveName}
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-none cursor-pointer"
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </Button>
                    <Button
                      onClick={() => {
                        setNameValue(user.name || '')
                        setIsEditingName(false)
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-[13px] font-bold text-slate-800 truncate pr-2">
                      {user.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingName(true)}
                      className="h-6 w-6 rounded-md text-slate-400 hover:bg-slate-100 shrink-0 cursor-pointer"
                    >
                      <Pencil size={11} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Edit Bio Field */}
              <div className="w-full space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info size={10} /> About status
                </label>
                {isEditingBio ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={bioValue}
                      onChange={(e) => setBioValue(e.target.value)}
                      className="h-8 text-[12px] font-bold px-2.5 rounded-lg border-slate-200 bg-white"
                      placeholder="Enter status..."
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBio()}
                    />
                    <Button
                      onClick={handleSaveBio}
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-none cursor-pointer"
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </Button>
                    <Button
                      onClick={() => {
                        setBioValue(
                          (user as any).bio ||
                            'Hey there! I am using VastuRent.',
                        )
                        setIsEditingBio(false)
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600 truncate pr-2">
                      {bioValue}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingBio(true)}
                      className="h-6 w-6 rounded-md text-slate-400 hover:bg-slate-100 shrink-0 cursor-pointer"
                    >
                      <Pencil size={11} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 3. ACCOUNT SECURITY SUB-SCREEN ── */}
        {subScreen === 'account' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
            <div className="bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Lock size={12} className="text-primary" /> Security Details
              </h4>

              <div className="space-y-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Email Address
                </span>
                <span className="text-[12px] font-bold text-slate-800 block bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {user.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Role
                </span>
                <span className="text-[11px] font-extrabold text-primary uppercase inline-block bg-primary-soft/60 px-3 py-1 rounded-full">
                  {user.role} Member
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Join Date
                </span>
                <span className="text-[12px] font-semibold text-slate-500 block">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'June 15, 2026'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. PRIVACY SUB-SCREEN ── */}
        {subScreen === 'privacy' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
            <div className="flex flex-col gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Shield size={12} className="text-primary" /> Privacy controls
              </h4>

              {/* Profile pic switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                    Profile Visibility
                  </span>
                  <p className="text-[9px] font-semibold text-slate-400">
                    Allow everyone to view your avatar image.
                  </p>
                </div>
                <Switch
                  checked={myShowProfile}
                  onCheckedChange={async (val) => {
                    try {
                      await updateSettings({ showProfile: val })
                      await queryClient.invalidateQueries({
                        queryKey: ['session'],
                      })
                      toast.success(
                        `Profile visibility set to ${val ? 'everyone' : 'nobody'}`,
                      )
                    } catch {
                      toast.error('Failed to update settings')
                    }
                  }}
                />
              </div>

              {/* Online status switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                    Online & Active Status
                  </span>
                  <p className="text-[9px] font-semibold text-slate-400">
                    Show your online ping indicator to contacts.
                  </p>
                </div>
                <Switch
                  checked={myShowOnline}
                  onCheckedChange={async (val) => {
                    try {
                      await updateSettings({ showOnline: val })
                      await queryClient.invalidateQueries({
                        queryKey: ['session'],
                      })
                      toast.success(
                        `Online status set to ${val ? 'everyone' : 'nobody'}`,
                      )
                    } catch {
                      toast.error('Failed to update settings')
                    }
                  }}
                />
              </div>
            </div>

            {/* Blocked accounts list */}
            <div className="flex flex-col gap-3 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Slash size={12} className="text-red-500" /> Blocked Contacts
              </h4>

              {blockedConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center gap-1 bg-slate-50/40 border border-dashed border-slate-200/50 rounded-xl">
                  <AlertCircle size={14} className="text-slate-300" />
                  <span className="text-[10px] font-semibold text-slate-400">
                    No blocked contacts
                  </span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {blockedConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar
                          image={conv.otherParticipant.image}
                          name={conv.otherParticipant.name}
                          size="sm"
                        />
                        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[100px]">
                          {conv.otherParticipant.name}
                        </span>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            await unblockConversation(conv.id)
                            toast.success(
                              `Unblocked ${conv.otherParticipant.name}`,
                            )
                          } catch {
                            toast.error('Failed to unblock user')
                          }
                        }}
                        variant="outline"
                        className="h-6 px-2.5 rounded-lg border-emerald-500/20 bg-emerald-50/50 hover:bg-emerald-50 text-[10px] font-black text-emerald-600 hover:text-emerald-700 shadow-none cursor-pointer"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 5. CHATS SUB-SCREEN ── */}
        {subScreen === 'chats' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
            {/* Wallpaper selection */}
            <div className="flex flex-col gap-3 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Wallpaper size={12} className="text-primary" /> Chat Theme
              </h4>
              <p className="text-[9px] font-semibold text-slate-400">
                Choose a wallpaper color scheme:
              </p>
              <div className="grid grid-cols-5 gap-2 mt-1">
                {[
                  {
                    id: 'classic',
                    color: 'bg-emerald-500/10 border-emerald-500/20',
                  },
                  { id: 'dark', color: 'bg-slate-800 border-slate-900' },
                  { id: 'blue', color: 'bg-sky-500/15 border-sky-400/20' },
                  { id: 'emerald', color: 'bg-teal-500/15 border-teal-400/20' },
                  { id: 'sand', color: 'bg-amber-500/10 border-amber-400/20' },
                ].map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => handleWallpaperChange(wp.id)}
                    className={cn(
                      'w-9 h-9 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 active:scale-95',
                      wp.color,
                      chatWallpaper === wp.id
                        ? 'border-primary scale-110 shadow-sm'
                        : 'border-transparent',
                    )}
                    title={`Wallpaper ${wp.id}`}
                  />
                ))}
              </div>
            </div>

            {/* Media visibility switch */}
            <div className="flex flex-col gap-3 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-[12px] font-bold text-slate-800">
                    Media Visibility
                  </span>
                  <p className="text-[9px] font-semibold text-slate-400">
                    Auto-hide attachment images/videos.
                  </p>
                </div>
                <Switch checked={hideMedia} onCheckedChange={setHideMedia} />
              </div>
            </div>
          </div>
        )}

        {/* ── 6. NOTIFICATIONS SUB-SCREEN ── */}
        {subScreen === 'notifications' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
            <div className="flex flex-col gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Bell size={12} className="text-primary" /> Audio & Banners
              </h4>

              {/* Sound Notifications switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-[12px] font-bold text-slate-800">
                    Alert Sounds
                  </span>
                  <p className="text-[9px] font-semibold text-slate-400">
                    Play sounds on receiving incoming messages.
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>

              {/* Push Banner switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-[12px] font-bold text-slate-800">
                    Browser Banners
                  </span>
                  <p className="text-[9px] font-semibold text-slate-400">
                    Show desktop notice banners when tab is inactive.
                  </p>
                </div>
                <Switch
                  checked={desktopEnabled}
                  onCheckedChange={handleDesktopToggle}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 7. STORAGE SUB-SCREEN ── */}
        {subScreen === 'storage' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
            <div className="flex flex-col gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <HardDrive size={12} className="text-primary" /> Attachment
                Sizes
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500">
                  <span>{storage.totalSize} MB of 15 GB Used</span>
                  <span className="text-primary font-black">
                    {storage.usedPercent}%
                  </span>
                </div>
                {/* Visual Storage Meter bar */}
                <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all"
                    style={{
                      width: `${Math.max(1, storage.usedPercent * 5)}%`,
                    }}
                    title="Media"
                  />
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${storage.audioCount > 0 ? 5 : 0}%` }}
                    title="Audio"
                  />
                  <div
                    className="h-full bg-amber-500 rounded-r-full transition-all"
                    style={{ width: `${storage.docCount > 0 ? 4 : 0}%` }}
                    title="Documents"
                  />
                </div>
                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />{' '}
                      Media
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                      {storage.mediaSize} MB
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />{' '}
                      Audio
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                      {storage.audioSize} MB
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />{' '}
                      Docs
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                      {storage.docSize} MB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 8. HELP SUB-SCREEN ── */}
        {subScreen === 'help' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
            <div className="bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-center items-center">
              <HelpCircle
                size={24}
                className="text-primary animate-bounce mt-2"
              />
              <h4 className="text-[13px] font-black text-slate-800">
                Need Assistance?
              </h4>
              <p className="text-[10px] font-semibold text-slate-500 leading-normal">
                If you have any questions regarding rentals, listings, payouts,
                or account security, our chat support is here 24/7.
              </p>
              <Button
                onClick={() => {
                  setShowNewChat(true)
                  toast.success('Opening new chat directory...')
                }}
                className="w-full h-8 text-[11px] font-black mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Contact Support Team
              </Button>
            </div>
          </div>
        )}
        {/* ── 9. REFERRAL INVITE SUB-SCREEN ── */}
        {subScreen === 'invite' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
            <div className="bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-center items-center">
              <UserPlus size={24} className="text-primary mt-2" />
              <h4 className="text-[13px] font-black text-slate-800">
                Spread the Word
              </h4>
              <p className="text-[10px] font-semibold text-slate-500 leading-normal">
                Invite hosts, buyers, and friends to VastuRent and help them
                find properties aligned with positive energy.
              </p>

              <div className="flex items-center gap-1.5 w-full mt-2 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 truncate flex-1 text-left select-all font-sans">
                  https://vasturent.com/invite
                </span>
                <Button
                  onClick={handleCopyLink}
                  size="icon"
                  className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-none cursor-pointer"
                >
                  {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
