import { Leaf, Calendar, Headset } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useChatStore } from '../../../../../store/useChatStore'
import { toast } from 'sonner'

interface MessageEmptyStateProps {
  showCards?: boolean
}

export function MessageEmptyState({
  showCards = true,
}: MessageEmptyStateProps) {
  const navigate = useNavigate()
  const { setShowNewChat } = useChatStore()

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4 sm:py-6 bg-transparent animate-fade-in select-none max-w-2xl mx-auto">
      {/* ── Scenery House Illustration ── */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto mb-4 flex items-center justify-center">
        <img
          src="/assets/welcome_house_illustration.png"
          alt="Welcome to your conversations"
          className="w-full h-full object-contain drop-shadow-sm animate-fade-in mix-blend-multiply"
        />
      </div>

      {/* ── Welcome Header ── */}
      <div className="max-w-md mb-6">
        <h3 className="text-2xl sm:text-[25px] font-bold text-[#091e15] tracking-tight font-display">
          Welcome to your conversations
        </h3>
        <p className="text-sm text-slate-500 mt-2.5 px-4 leading-relaxed font-medium font-sans max-w-sm mx-auto">
          Select a chat from the list to view your conversation or start a new
          one.
        </p>
      </div>

      {/* ── Quick Action Cards ── */}
      {showCards && (
        <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-2xl items-stretch justify-center px-4">
          {/* Browse listings card */}
          <div
            onClick={() => navigate({ to: '/' })}
            className="flex-1 flex items-center gap-3.5 p-4 bg-white border border-[#f0efe9] rounded-2xl cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#0f513d]/20 hover:bg-slate-50/30 active:scale-[0.98] transition-all text-left"
          >
            <span className="w-10 h-10 rounded-full border border-[#0f513d]/30 text-[#0f513d] flex items-center justify-center shrink-0 bg-transparent">
              <Leaf size={18} className="text-[#0f513d]" />
            </span>
            <div>
              <span className="text-[13px] font-bold text-[#0f513d] block font-sans tracking-tight">
                Browse Listings
              </span>
              <span className="text-[11px] font-normal text-slate-400 block mt-0.5 font-sans">
                Explore homes
              </span>
            </div>
          </div>

          {/* My Bookings card */}
          <div
            onClick={() => {
              toast.info('Opening bookings dashboard...')
              window.dispatchEvent(
                new CustomEvent('switch-dashboard-tab', {
                  detail: { tab: 'bookings' },
                }),
              )
            }}
            className="flex-1 flex items-center gap-3.5 p-4 bg-white border border-[#f0efe9] rounded-2xl cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#0f513d]/20 hover:bg-slate-50/30 active:scale-[0.98] transition-all text-left"
          >
            <span className="w-10 h-10 rounded-full border border-[#0f513d]/30 text-[#0f513d] flex items-center justify-center shrink-0 bg-transparent">
              <Calendar size={18} className="text-[#0f513d]" />
            </span>
            <div>
              <span className="text-[13px] font-bold text-[#0f513d] block font-sans tracking-tight">
                My Bookings
              </span>
              <span className="text-[11px] font-normal text-slate-400 block mt-0.5 font-sans">
                View reservations
              </span>
            </div>
          </div>

          {/* Contact Support card */}
          <div
            onClick={() => {
              setShowNewChat(true)
              toast.success(
                'Directory search opened. Select support team to chat.',
              )
            }}
            className="flex-1 flex items-center gap-3.5 p-4 bg-white border border-[#f0efe9] rounded-2xl cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#0f513d]/20 hover:bg-slate-50/30 active:scale-[0.98] transition-all text-left"
          >
            <span className="w-10 h-10 rounded-full border border-[#0f513d]/30 text-[#0f513d] flex items-center justify-center shrink-0 bg-transparent">
              <Headset size={18} className="text-[#0f513d]" />
            </span>
            <div>
              <span className="text-[13px] font-bold text-[#0f513d] block font-sans tracking-tight">
                Support
              </span>
              <span className="text-[11px] font-normal text-slate-400 block mt-0.5 font-sans">
                Get help
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
