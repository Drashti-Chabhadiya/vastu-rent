import { Heart, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

interface ProductImageGalleryProps {
  images: string[]
  title: string
  selectedImage: number
  setSelectedImage: (idx: number) => void
  liked: boolean
  toggleLike: () => void
  copied: boolean
  handleShare: () => void
}

export const ProductImageGallery = ({
  images,
  title,
  selectedImage,
  setSelectedImage,
  liked,
  toggleLike,
  copied,
  handleShare,
}: ProductImageGalleryProps) => {
  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm group">
        <img
          src={images[selectedImage]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Image Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-[0.98]"
        >
          <ChevronLeft size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-[0.98]"
        >
          <ChevronRight size={20} />
        </Button>

        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLike}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-[0.98]',
              liked
                ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-500'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white',
            )}
          >
            <Heart size={18} className={liked ? 'fill-current' : ''} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-primary hover:bg-white shadow-lg flex items-center justify-center transition-all active:scale-[0.98]"
            title="Copy link"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Share2 size={16} />
            )}
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => setSelectedImage(idx)}
            className={cn(
              'relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 p-0 hover:bg-transparent active:scale-[0.98]',
              selectedImage === idx
                ? 'border-brand shadow-md'
                : 'border-transparent hover:border-gray-200',
            )}
          >
            <img
              src={img}
              alt={`${title} ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedImage !== idx && (
              <div className="absolute inset-0 bg-white/20" />
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
