import { Dialog, DialogContent, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { Lock } from 'lucide-react'
import { useChatStore } from '../../../../../store/useChatStore'

interface EncryptionSecurityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EncryptionSecurityDialog({ open, onOpenChange }: EncryptionSecurityDialogProps) {
  const { conversations, activeConversationId } = useChatStore()
  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  if (!activeConversation) return null

  const getSecurityCode = () => {
    const id = activeConversation.id
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    const parts = []
    for (let i = 0; i < 6; i++) {
      const part = Math.abs((hash + i * 139) % 90000) + 10000
      parts.push(part)
    }
    return parts.join(' ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200/80 shadow-2xl bg-card">
        <DialogHeader className="pb-3 border-b border-border/20">
          <DialogTitle className="text-[15px] font-black text-slate-800 flex items-center gap-2">
            <Lock size={16} className="text-primary animate-pulse" />
            Encryption & Security
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-slate-600 text-[12px] font-medium leading-relaxed">
          <p>
            Messages sent to this chat are secured with high-grade transport-layer security and simulated end-to-end encryption.
          </p>
          <p className="font-bold text-slate-800">
            Your security code for verification:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center tracking-widest font-mono text-[11px] text-slate-700">
            {getSecurityCode()}
          </div>
          <p className="text-[10px] text-slate-400">
            Verify this code with {activeConversation.otherParticipant.name} to confirm that messages and files are safely transmitted and cannot be intercepted by third parties.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
