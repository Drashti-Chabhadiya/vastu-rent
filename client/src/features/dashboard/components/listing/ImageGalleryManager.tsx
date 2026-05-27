import { useRef, useEffect } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useUploadProductImages } from '#/hook'
import { Loader } from '#/components/ui/loader'

interface ImageGalleryManagerProps {
  images: string[]
  onChange: (images: string[]) => void
  onUploadStatusChange?: (uploading: boolean) => void
}

export const ImageGalleryManager = ({
  images,
  onChange,
  onUploadStatusChange,
}: ImageGalleryManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: uploadImages, isPending: uploading } =
    useUploadProductImages()

  useEffect(() => {
    onUploadStatusChange?.(uploading)
  }, [uploading, onUploadStatusChange])

  const handleUpload = async (files: FileList | null) => {
    if (!files) return
    try {
      const newUrls = await uploadImages(files)
      onChange([...images, ...newUrls])
    } catch (error) {
      console.error('Upload Error:', error)
      alert('Failed to upload one or more images. Please try again.')
    }
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newImages.length) return
    ;[newImages[index], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[index],
    ]
    onChange(newImages)
  }

  const setMainImage = (index: number) => {
    const newImages = [...images]
    const [main] = newImages.splice(index, 1)
    newImages.unshift(main)
    onChange(newImages)
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {/* Upload Trigger */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= 10}
          className="aspect-square p-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted-light/50 text-dash-text-soft transition-all hover:bg-muted-light hover:border-dash-brand/30 disabled:opacity-50 group min-w-0 min-h-0 h-auto w-auto active:scale-[0.98]"
        >
          {uploading ? (
            <Loader variant="brand" size={24} />
          ) : (
            <>
              <Plus
                size={24}
                className="group-hover:text-dash-brand transition-colors"
              />
              <span className="text-[10px] font-bold uppercase">Add Photo</span>
            </>
          )}
        </Button>

        {/* Previews */}
        {images.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-2xl border border-border/30 group shadow-sm bg-card"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex items-center justify-between">
                {i === 0 ? (
                  <Badge className="bg-dash-success text-primary-foreground border-none font-bold text-[8px] uppercase px-1.5 py-0 h-4">
                    Cover
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setMainImage(i)}
                    className="p-0 rounded-full bg-card/20 text-primary-foreground hover:bg-dash-brand h-6 w-6 active:scale-[0.98] transition-all hover:text-primary-foreground"
                  >
                    <Star size={10} fill="currentColor" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(i)}
                  className="p-0 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive/90 h-6 w-6 active:scale-[0.98] transition-all hover:text-destructive-foreground"
                >
                  <Trash2 size={10} />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={i === 0}
                  onClick={() => moveImage(i, 'left')}
                  className="p-0 rounded-full bg-card/20 text-primary-foreground hover:bg-primary-soft/40 disabled:opacity-20 transition-all active:scale-[0.98] h-7 w-7 hover:text-primary-foreground"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={i === images.length - 1}
                  onClick={() => moveImage(i, 'right')}
                  className="p-0 rounded-full bg-card/20 text-primary-foreground hover:bg-primary-soft/40 disabled:opacity-20 transition-all active:scale-[0.98] h-7 w-7 hover:text-primary-foreground"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>

            <div className="absolute left-2 bottom-2 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-primary-foreground flex items-center justify-center group-hover:opacity-0 transition-opacity">
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
    </div>
  )
}
