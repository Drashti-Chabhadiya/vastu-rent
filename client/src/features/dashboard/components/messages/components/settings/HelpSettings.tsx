import { HelpCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useChatStore } from '../../../../../../store/useChatStore'
import { toast } from 'sonner'

export function HelpSettings() {
  const { setShowNewChat } = useChatStore()

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
      <div className="bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-center items-center">
        <HelpCircle size={24} className="text-primary animate-bounce mt-2" />
        <h4 className="text-[13px] font-black text-slate-800">
          Need Assistance?
        </h4>
        <p className="text-[10px] font-semibold text-slate-500 leading-normal">
          If you have any questions regarding rentals, listings, payouts, or
          account security, our chat support is here 24/7.
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
  )
}
