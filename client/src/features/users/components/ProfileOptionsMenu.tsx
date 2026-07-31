import { useState } from 'react'
import { toast } from 'sonner'
import {
  Share2,
  Heart,
  Link as LinkIcon,
  Flag,
  Ban,
  MoreVertical,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Textarea } from '#/components/ui/textarea'

interface ProfileOptionsMenuProps {
  userName: string
  onShare: () => void
  triggerClassName?: string
  triggerIconSize?: number
}

export function ProfileOptionsMenu({
  userName,
  onShare,
  triggerClassName = 'w-10 h-10 rounded-full bg-card/95 shadow-md hover:bg-card text-foreground backdrop-blur-xs outline-none',
  triggerIconSize = 18,
}: ProfileOptionsMenuProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const toggleSaveSeller = () => {
    if (isSaved) {
      setIsSaved(false)
      toast.success(`Removed ${userName} from favorite sellers.`)
    } else {
      setIsSaved(true)
      toast.success(`Saved ${userName} to favorite sellers!`)
    }
  }

  const handleReportSubmit = () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting.')
      return
    }
    toast.success(
      `Report submitted for ${userName}. Our team will review it shortly.`,
    )
    setShowReportDialog(false)
    setReportReason('')
  }

  const handleBlockConfirm = () => {
    toast.success(
      `You have blocked ${userName}. They can no longer contact you.`,
    )
    setShowBlockDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={triggerClassName}>
            <MoreVertical size={triggerIconSize} className="text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 rounded-[20px] p-2 bg-card/95 backdrop-blur-md shadow-2xl border border-border z-50 animate-in zoom-in-95 duration-150"
        >
          <DropdownMenuItem
            onClick={onShare}
            className="rounded-xl px-3 py-2 text-xs font-bold text-foreground cursor-pointer hover:bg-muted flex items-center gap-2.5"
          >
            <Share2 size={16} />
            Share Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault()
              toggleSaveSeller()
            }}
            className="rounded-xl px-3 py-2 text-xs font-bold text-foreground cursor-pointer hover:bg-muted flex items-center gap-2.5"
          >
            <Heart
              size={16}
              className={isSaved ? 'fill-primary text-primary' : ''}
            />
            {isSaved ? 'Saved Seller' : 'Save Seller'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Profile link copied to clipboard!')
            }}
            className="rounded-xl px-3 py-2 text-xs font-bold text-foreground cursor-pointer hover:bg-muted flex items-center gap-2.5"
          >
            <LinkIcon size={16} />
            Copy Profile Link
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border my-1" />

          <DropdownMenuItem
            onClick={() => setShowReportDialog(true)}
            className="rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-600 focus:text-red-600 data-[highlighted]:text-red-600 hover:bg-red-50 focus:bg-red-50 data-[highlighted]:bg-red-50 dark:hover:bg-red-950/40 dark:focus:bg-red-950/40 dark:data-[highlighted]:bg-red-950/40 cursor-pointer flex items-center gap-2.5"
          >
            <Flag size={16} className="text-red-600 dark:text-red-400" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowBlockDialog(true)}
            className="rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-600 focus:text-red-600 data-[highlighted]:text-red-600 hover:bg-red-50 focus:bg-red-50 data-[highlighted]:bg-red-50 dark:hover:bg-red-950/40 dark:focus:bg-red-950/40 dark:data-[highlighted]:bg-red-950/40 cursor-pointer flex items-center gap-2.5"
          >
            <Ban size={16} className="text-red-600 dark:text-red-400" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report User Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Report {userName}</DialogTitle>
            <DialogDescription>
              Please let us know why you are reporting this user. Your report
              will be kept anonymous.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Provide details about the issue..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReportDialog(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReportSubmit}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Alert */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will no longer be able to message you, view your
              profile, or see your listings. This action can be undone later
              from your settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockConfirm}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
