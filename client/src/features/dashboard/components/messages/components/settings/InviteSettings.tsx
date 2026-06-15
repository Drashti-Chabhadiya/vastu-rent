import { useState } from 'react'
import { UserPlus, Copy, Check } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { toast } from 'sonner'

export function InviteSettings() {
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://vasturent.com/invite')
    setCopiedLink(true)
    toast.success('Invitation link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
      <div className="bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-center items-center">
        <UserPlus size={24} className="text-primary mt-2" />
        <h4 className="text-[13px] font-black text-slate-800">
          Spread the Word
        </h4>
        <p className="text-[10px] font-semibold text-slate-500 leading-normal">
          Invite hosts, buyers, and friends to VastuRent and help them find
          properties aligned with positive energy.
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
  )
}
