import { Lock } from 'lucide-react'

interface AccountSettingsProps {
  user: any
}

export function AccountSettings({ user }: AccountSettingsProps) {
  return (
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
  )
}
