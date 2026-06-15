import { useState, useEffect } from 'react'
import {
  ChevronRight,
  ArrowLeft,
  KeyRound,
  Shield,
  MessageSquare,
  Bell,
  HardDrive,
  HelpCircle,
  UserPlus,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { UserAvatar } from './UserAvatar'
import { useChatStore } from '../../../../../store/useChatStore'
import { authClient } from '#/lib/auth/auth-client'
import { useQuery } from '@tanstack/react-query'
import { cn } from '#/lib/utils'

// Sub-components
import { ProfileSettings } from './settings/ProfileSettings'
import { AccountSettings } from './settings/AccountSettings'
import { PrivacySettings } from './settings/PrivacySettings'
import { ChatsSettings } from './settings/ChatsSettings'
import { NotificationsSettings } from './settings/NotificationsSettings'
import { StorageSettings } from './settings/StorageSettings'
import { HelpSettings } from './settings/HelpSettings'
import { InviteSettings } from './settings/InviteSettings'

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
  const { setShowDetailsPanel, setActivePanel } = useChatStore()

  // Local state for displaying Bio in the main settings card list
  const [bioValue, setBioValue] = useState('')

  // Sync edited values when session query updates
  useEffect(() => {
    if (session?.user) {
      setBioValue(
        (session.user as any).bio || 'Hey there! I am using VastuRent.',
      )
    }
  }, [session])

  if (!session?.user) {
    return (
      <div
        className={cn(
          'flex flex-col h-full bg-[#fbf9f4] p-4 gap-4',
          !isEmbedded
            ? 'w-[320px] shrink-0 border-l border-slate-200/80'
            : 'flex-1',
        )}
      >
        {/* Header Skeleton */}
        {!isEmbedded && (
          <div className="flex items-center gap-4 py-2 border-b border-slate-200/30">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        )}

        {/* User Card Skeleton */}
        <div className="flex items-center gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-4 shadow-sm">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2 rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        </div>

        {/* List Card Skeleton */}
        <div className="bg-white/70 border border-slate-200/30 rounded-2xl p-4 shadow-xs space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-1/4 rounded" />
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="w-3 h-3 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const user = session.user

  // Navigate back or collapse
  const handleBack = () => {
    if (subScreen === 'main') {
      if (isEmbedded) {
        onBackToInfo?.()
      } else {
        setActivePanel('about')
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
        {subScreen === 'profile' && <ProfileSettings user={user} />}

        {/* ── 3. ACCOUNT SECURITY SUB-SCREEN ── */}
        {subScreen === 'account' && <AccountSettings user={user} />}

        {/* ── 4. PRIVACY SUB-SCREEN ── */}
        {subScreen === 'privacy' && <PrivacySettings />}

        {/* ── 5. CHATS SUB-SCREEN ── */}
        {subScreen === 'chats' && <ChatsSettings />}

        {/* ── 6. NOTIFICATIONS SUB-SCREEN ── */}
        {subScreen === 'notifications' && <NotificationsSettings />}

        {/* ── 7. STORAGE SUB-SCREEN ── */}
        {subScreen === 'storage' && <StorageSettings />}

        {/* ── 8. HELP SUB-SCREEN ── */}
        {subScreen === 'help' && <HelpSettings />}

        {/* ── 9. REFERRAL INVITE SUB-SCREEN ── */}
        {subScreen === 'invite' && <InviteSettings />}
      </div>
    </div>
  )
}
