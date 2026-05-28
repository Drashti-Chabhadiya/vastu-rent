import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { FolderPlus, Send } from 'lucide-react'
import { useCreateCategoryRequest } from '#/hook/use-category-requests'
import { toast } from 'sonner'
import { LoadingOverlay } from '#/components/ui/loader'

interface RequestCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestCategoryModal({
  open,
  onOpenChange,
}: RequestCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { mutate: createRequest, isPending } = useCreateCategoryRequest()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createRequest(
      { name, description, requestReason: 'Requested from Add Listing form' },
      {
        onSuccess: () => {
          toast.success('Category request sent to admin successfully!')
          setName('')
          setDescription('')
          onOpenChange(false)
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to send request')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/30 bg-card p-0 overflow-hidden shadow-2xl">
        <div className="bg-primary/5 p-6 border-b border-border/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FolderPlus size={24} />
          </div>
          <div>
            <DialogTitle className="text-xl font-black text-foreground">
              Request New Category
            </DialogTitle>
            <p className="text-xs text-muted-foreground/80 mt-1 font-bold">
              Admin will review and approve your category.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 relative">
          {isPending && <LoadingOverlay message="Sending request..." />}

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground ml-1">
              Category Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drone Cameras"
              required
              className="h-11 rounded-xl bg-muted-light/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/30 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground ml-1">
              Description (Optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what items go here..."
              className="min-h-[80px] rounded-xl bg-muted-light/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/30 font-medium"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full font-bold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="rounded-full font-bold bg-primary hover:bg-primary-hover px-6 flex items-center gap-2"
            >
              <Send size={14} /> Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
