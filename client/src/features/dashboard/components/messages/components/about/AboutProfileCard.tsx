import { X, Phone, Video, User, Search } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useChatStore } from '../../../../../../store/useChatStore'
import { authClient } from '#/lib/auth/auth-client'
import { formatLastActive } from '#/lib/chat-utils'
import { toast } from 'sonner'

interface AboutProfileCardProps {
  otherParticipant: any
}

export function AboutProfileCard({ otherParticipant }: AboutProfileCardProps) {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const myShowOnline = (session?.user as any)?.showOnline !== false

  const { checkOnline, setShowDetailsPanel, setShowConversationSearch } =
    useChatStore()

  const otherPersonOnline =
    otherParticipant.isOnline || checkOnline(otherParticipant.id)
  const canSeeStatus =
    myShowOnline &&
    otherParticipant.lastActive !== null &&
    otherParticipant.lastActive !== undefined
  const showOnlineStatus = canSeeStatus && otherPersonOnline

  return (
    <div className="bg-card border border-border/30 rounded-[2rem] shadow-2xs overflow-hidden flex flex-col items-center pb-6 shrink-0 relative">
      {/* Top gradient section */}
      <div className="h-28 w-full bg-gradient-to-br from-brand-green-bubble via-brand-green-tint to-card shrink-0 relative">
        {/* Floating Close Button */}
        <button
          onClick={() => setShowDetailsPanel(false)}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-muted-foreground backdrop-blur-sm border border-white/25 flex items-center justify-center transition-colors cursor-pointer z-20 shadow-3xs"
          title="Close panel"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Overlapping Avatar */}
      <div className="relative -mt-12 z-10 w-24 h-24 rounded-full overflow-hidden border-[3.5px] border-card shadow-md">
        {otherParticipant.image ? (
          <img
            src={otherParticipant.image}
            alt={otherParticipant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
            {otherParticipant.name.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name & verification badge */}
      <div className="mt-3 flex items-center justify-center gap-1.5 px-4">
        <h4 className="text-[16px] font-bold text-foreground leading-tight font-sans tracking-tight">
          {otherParticipant.name}
        </h4>
        {otherParticipant.isGreenMember && (
          <svg
            className="w-[15px] h-[15px] text-emerald-600 fill-emerald-600 shrink-0 select-none"
            viewBox="0 0 24 24"
          >
            <path
              d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z"
              fill="currentColor"
            />
            <polyline
              points="8.5 12.5 10.5 14.5 15.5 9.5"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </div>

      {/* Online indicator status */}
      <div className="flex items-center justify-center mt-1">
        {showOnlineStatus ? (
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
            <span className="text-[12px] font-bold text-emerald-600">
              Online
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-muted mr-1.5 inline-block"></span>
            <span className="text-[12px] font-semibold text-muted-dark">
              Offline
            </span>
          </div>
        )}
        <span className="text-[11px] text-muted-dark mt-0.5 ml-1">
          {showOnlineStatus
            ? 'Last seen just now'
            : (() => {
                const formatted = formatLastActive(otherParticipant.lastActive)
                return formatted === 'Offline'
                  ? 'Offline'
                  : `Last seen ${formatted}`
              })()}
        </span>
      </div>

      {/* Icon action buttons */}
      <div className="flex justify-between gap-5 w-full mt-5 px-6 shrink-0">
        <div className="flex flex-col items-center flex-1">
          <button
            onClick={() => toast.info('Starting audio call...')}
            className="w-10 h-10 rounded-full bg-brand-green-tint hover:bg-brand-green-bubble text-brand-primary-deep border-brand-green-border/20 flex items-center justify-center transition-colors cursor-pointer shadow-3xs"
            title="Audio Call"
          >
            <Phone size={16} />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground mt-2 font-sans">
            Audio
          </span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <button
            onClick={() => toast.info('Starting video call...')}
            className="w-10 h-10 rounded-full bg-brand-green-tint hover:bg-brand-green-bubble text-brand-primary-deep border-brand-green-border/20 flex items-center justify-center transition-colors cursor-pointer shadow-3xs"
            title="Video Call"
          >
            <Video size={16} />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground mt-2 font-sans">
            Video
          </span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <button
            onClick={() =>
              navigate({
                to: '/users/$id',
                params: { id: otherParticipant.id },
              })
            }
            className="w-10 h-10 rounded-full bg-brand-green-tint hover:bg-brand-green-bubble text-brand-primary-deep border-brand-green-border/20 flex items-center justify-center transition-colors cursor-pointer shadow-3xs"
            title="Profile Details"
          >
            <User size={16} />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground mt-2 font-sans">
            Profile
          </span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <button
            onClick={() => setShowConversationSearch(true)}
            className="w-10 h-10 rounded-full bg-brand-green-tint hover:bg-brand-green-bubble text-brand-primary-deep border-brand-green-border/20 flex items-center justify-center transition-colors cursor-pointer shadow-3xs"
            title="Search Chat"
          >
            <Search size={16} />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground mt-2 font-sans">
            Search
          </span>
        </div>
      </div>
    </div>
  )
}
