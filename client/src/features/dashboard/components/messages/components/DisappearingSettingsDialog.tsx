import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Clock, Check } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useState, useEffect } from 'react'
import { useChatStore } from '../../../../../store/useChatStore'
import { toast } from 'sonner'

const DURATIONS = [
  { label: 'Off', value: 0, description: 'Keep messages forever' },
  {
    label: '24 Hours',
    value: 86400,
    description: 'Messages vanish after 1 day',
  },
  {
    label: '7 Days',
    value: 604800,
    description: 'Messages vanish after 1 week',
  },
  {
    label: '90 Days',
    value: 7776000,
    description: 'Messages vanish after 3 months',
  },
]

export function DisappearingSettingsDialog() {
  const {
    disappearingTargetConvId,
    setDisappearingTargetConvId,
    conversations,
    setDisappearingMessages,
  } = useChatStore()

  const activeConversation = conversations.find(
    (c) => c.id === disappearingTargetConvId,
  )

  const open = !!disappearingTargetConvId
  const currentDuration = activeConversation?.disappearingDuration || 0

  const [selectedDuration, setSelectedDuration] =
    useState<number>(currentDuration)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state if open or currentDuration changes
  useEffect(() => {
    if (open) {
      setSelectedDuration(currentDuration)
    }
  }, [open, currentDuration])

  const handleSave = async () => {
    if (!disappearingTargetConvId) return
    try {
      setIsSaving(true)
      await setDisappearingMessages(disappearingTargetConvId, selectedDuration)
      const label =
        DURATIONS.find((opt) => opt.value === selectedDuration)?.label || 'Off'
      toast.success(`Disappearing messages set to: ${label}`)
      setDisappearingTargetConvId(null)
    } catch (err) {
      console.error('Failed to set disappearing messages duration:', err)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDisappearingTargetConvId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md',
          'rounded-3xl',
          'p-0',
          'overflow-hidden',
          'border-border/30',
          'shadow-2xl',
          'flex flex-col',
        )}
      >
        <DialogHeader
          className={cn(
            'px-6',
            'pt-6',
            'pb-4',
            'border-b',
            'border-border/30',
            'flex flex-row items-center justify-between',
          )}
        >
          <DialogTitle
            className={cn(
              'text-[15px]',
              'font-black',
              'text-foreground',
              'flex',
              'items-center',
              'gap-2',
            )}
          >
            <Clock size={18} className="text-primary animate-pulse" />
            Disappearing Messages
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <p className="text-[11px] font-bold text-muted-dark leading-relaxed">
            For more privacy and storage, new messages will disappear from this
            chat for everyone after the selected duration. Old messages won't be
            affected.
          </p>

          <div className="space-y-2">
            {DURATIONS.map((opt) => {
              const isSelected = selectedDuration === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer outline-none',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border/20 hover:border-border/40 hover:bg-muted-light text-foreground',
                  )}
                >
                  <div className="space-y-0.5">
                    <span className="text-[12px] font-black">{opt.label}</span>
                    <p
                      className={cn(
                        'text-[10px] font-medium',
                        isSelected ? 'text-primary/80' : 'text-muted-dark',
                      )}
                    >
                      {opt.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3 border-t border-border/10 bg-muted-light/30">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl text-[11px] font-bold cursor-pointer h-9 px-4"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl text-[11px] font-bold cursor-pointer h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/95"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Apply settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
