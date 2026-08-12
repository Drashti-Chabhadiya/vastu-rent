import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'

interface DisputeDialogProps {
  open: boolean
  onClose: () => void
  rental: any
  disputeReason: string
  setDisputeReason: (val: string) => void
  disputeDescription: string
  setDisputeDescription: (val: string) => void
  onSubmit: () => void
  isPending: boolean
}

export function DisputeDialog({
  open,
  onClose,
  rental,
  disputeReason,
  setDisputeReason,
  disputeDescription,
  setDisputeDescription,
  onSubmit,
  isPending,
}: DisputeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'sm:max-w-[480px]',
          'bg-card',
          'rounded-3xl',
          'p-6',
          'border',
          'border-border/30',
          'shadow-xl',
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn('text-xl', 'font-bold', 'text-foreground')}
          >
            Report Dispute for {rental?.product?.title || 'Rental'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            If you have experienced an issue with this booking, please select a
            reason and describe it. Vastu Support will review your report.
          </DialogDescription>
        </DialogHeader>

        <div className={cn('space-y-4', 'py-4')}>
          <div className="space-y-2">
            <Label
              className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
            >
              Reason for Dispute
            </Label>
            <Select value={disputeReason} onValueChange={setDisputeReason}>
              <SelectTrigger className="w-full rounded-xl border-border bg-background">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/30 rounded-xl">
                <SelectItem value="Item damaged or not working">
                  Item damaged or not working
                </SelectItem>
                <SelectItem value="Item not as described">
                  Item not as described
                </SelectItem>
                <SelectItem value="Host did not show up / unavailable">
                  Host did not show up / unavailable
                </SelectItem>
                <SelectItem value="Billing or pricing issue">
                  Billing or pricing issue
                </SelectItem>
                <SelectItem value="Security deposit dispute">
                  Security deposit dispute
                </SelectItem>
                <SelectItem value="Late return / pickup dispute">
                  Late return / pickup dispute
                </SelectItem>
                <SelectItem value="Other operational issues">
                  Other operational issues
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
            >
              Detailed Description
            </Label>
            <Textarea
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
              placeholder="Provide details about the issue. Be as specific as possible so our support team can resolve it fairly."
              className="min-h-[120px] rounded-xl border-border bg-background focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <DialogFooter className={cn('flex', 'gap-2', 'sm:justify-end')}>
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full font-bold h-11 bg-muted text-muted-foreground hover:bg-muted-dark/20 transition-all border-none"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending || !disputeReason || !disputeDescription.trim()}
            className={cn(
              'rounded-xl',
              'bg-primary',
              'hover:bg-primary-hover',
              'text-primary-foreground',
              'font-semibold',
            )}
          >
            {isPending ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
