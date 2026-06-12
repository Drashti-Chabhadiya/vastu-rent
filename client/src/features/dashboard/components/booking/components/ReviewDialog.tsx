import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import { Star } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useUploadProductImage } from '#/hook'
import { toast } from 'sonner'

interface ReviewDialogProps {
  open: boolean
  onClose: () => void
  rental: any
  rating: number
  setRating: (r: number) => void
  comment: string
  setComment: (c: string) => void
  uploadedImages: string[]
  setUploadedImages: (imgs: string[] | ((prev: string[]) => string[])) => void
  onSubmit: () => void
  isPending: boolean
}

export function ReviewDialog({
  open,
  onClose,
  rental,
  rating,
  setRating,
  comment,
  setComment,
  uploadedImages,
  setUploadedImages,
  onSubmit,
  isPending,
}: ReviewDialogProps) {
  const [isUploading, setIsUploading] = useState(false)
  const uploadProductImage = useUploadProductImage()

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
            Write a Review for {rental?.product?.title}
          </DialogTitle>
        </DialogHeader>

        <div className={cn('space-y-6', 'py-4')}>
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label
              className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
            >
              Rating
            </Label>
            <div className={cn('flex', 'items-center', 'gap-1.5')}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setRating(star)}
                  className={cn(
                    'p-1',
                    'transition-transform',
                    'active:scale-90',
                    'cursor-pointer',
                    'h-auto w-auto',
                    'hover:bg-transparent',
                  )}
                >
                  <Star
                    size={28}
                    className={cn(
                      'stroke-[2]',
                      star <= rating
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground/30 fill-transparent',
                    )}
                  />
                </Button>
              ))}
              <span
                className={cn(
                  'text-sm',
                  'font-bold',
                  'text-muted-dark',
                  'ml-2',
                )}
              >
                ({rating}.0 / 5.0)
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label
              className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
            >
              Comment
            </Label>
            <Textarea
              placeholder="Product quality was very good. Sturdy and easy to use..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={cn(
                'rounded-xl',
                'border-border',
                'min-h-[100px]',
                'text-sm',
                'focus-visible:ring-primary',
              )}
            />
          </div>

          {/* Review Images */}
          <div className="space-y-2">
            <Label
              className={cn('text-sm', 'font-semibold', 'text-foreground/80')}
            >
              Review Images (Optional)
            </Label>
            <div className={cn('flex', 'flex-wrap', 'gap-3', 'items-center')}>
              {uploadedImages.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    'relative',
                    'w-16',
                    'h-16',
                    'rounded-xl',
                    'overflow-hidden',
                    'border',
                    'border-border/30',
                    'bg-muted-light',
                  )}
                >
                  <img
                    src={img}
                    className={cn('w-full', 'h-full', 'object-cover')}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      setUploadedImages((prev: string[]) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className={cn(
                      'absolute',
                      'top-1',
                      'right-1',
                      'rounded-full',
                      'w-4',
                      'h-4',
                      'flex',
                      'items-center',
                      'justify-center',
                      'text-[9px]',
                      'font-bold',
                      'p-0',
                    )}
                  >
                    ×
                  </Button>
                </div>
              ))}

              {uploadedImages.length < 3 && (
                <Label
                  className={cn(
                    'w-16 h-16 rounded-xl border border-dashed border-border/120 flex flex-col items-center justify-center text-muted-dark hover:text-primary hover:border-primary transition-colors cursor-pointer text-[10px] font-bold gap-1',
                    isUploading && 'opacity-50 pointer-events-none',
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setIsUploading(true)
                        const url = await uploadProductImage.mutateAsync(file)
                        setUploadedImages((prev: string[]) => [...prev, url])
                      } catch {
                        toast.error('Image upload failed.')
                      } finally {
                        setIsUploading(false)
                      }
                    }}
                  />
                  {isUploading ? '...' : '+ Add'}
                </Label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className={cn('flex', 'gap-2', 'sm:justify-end')}>
          <Button
            variant="outline"
            onClick={onClose}
            className={cn('rounded-xl', 'border-border', 'font-semibold')}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending}
            className={cn(
              'rounded-xl',
              'bg-primary',
              'hover:bg-primary-hover',
              'text-primary-foreground',
              'font-semibold',
            )}
          >
            {isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
