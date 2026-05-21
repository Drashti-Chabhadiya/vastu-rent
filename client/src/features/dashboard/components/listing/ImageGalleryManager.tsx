import { useRef } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { useUploadProductImages } from '#/hook'

interface ImageGalleryManagerProps {
  images: string[]
  onChange: (images: string[]) => void
}

export const ImageGalleryManager = ({
  images,
  onChange,
}: ImageGalleryManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: uploadImages, isPending: uploading } =
    useUploadProductImages()

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
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= 10}
          className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-dash-text-soft transition-all hover:bg-gray-50 hover:border-dash-brand/30 disabled:opacity-50 group"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-dash-brand/30 border-t-dash-brand rounded-full animate-spin" />
          ) : (
            <>
              <Plus
                size={24}
                className="group-hover:text-dash-brand transition-colors"
              />
              <span className="text-[10px] font-bold uppercase">Add Photo</span>
            </>
          )}
        </button>

        {/* Previews */}
        {images.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 group shadow-sm bg-white"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex items-center justify-between">
                {i === 0 ? (
                  <Badge className="bg-dash-success text-white border-none font-bold text-[8px] uppercase px-1.5 py-0 h-4">
                    Cover
                  </Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMainImage(i)}
                    className="p-1.5 rounded-full bg-white/20 text-white hover:bg-dash-brand transition-colors"
                  >
                    <Star size={10} fill="currentColor" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveImage(i, 'left')}
                  className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-20 transition-all active:scale-90"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={i === images.length - 1}
                  onClick={() => moveImage(i, 'right')}
                  className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-20 transition-all active:scale-90"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="absolute left-2 bottom-2 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white flex items-center justify-center group-hover:opacity-0 transition-opacity">
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
