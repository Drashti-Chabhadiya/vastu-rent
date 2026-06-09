import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Maximize2,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import { ProductImageViewer } from './ProductImageViewer'

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
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setHoverPos({ x, y })
  }

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm group cursor-zoom-in"
        onClick={() => setIsViewerOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[selectedImage]}
          alt={title}
          style={{
            transformOrigin: isHovered
              ? `${hoverPos.x}% ${hoverPos.y}%`
              : 'center',
          }}
          className={cn(
            'w-full h-full object-cover transition-transform duration-300 ease-out pointer-events-none',
            isHovered ? 'scale-175' : 'scale-100',
          )}
        />

        {/* Zoom Overlay Indicator */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl text-foreground font-semibold text-sm flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Maximize2 size={16} />
            <span>Click to zoom</span>
          </div>
        </div>

        {/* Image Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedImage(
              selectedImage > 0 ? selectedImage - 1 : images.length - 1,
            )
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-card active:scale-[0.98]"
        >
          <ChevronLeft size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedImage(
              selectedImage < images.length - 1 ? selectedImage + 1 : 0,
            )
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-card active:scale-[0.98]"
        >
          <ChevronRight size={20} />
        </Button>

        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              toggleLike()
            }}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-[0.98]',
              liked
                ? 'bg-danger text-destructive hover:bg-danger hover:text-destructive'
                : 'bg-card/90 backdrop-blur-sm text-muted-foreground hover:text-destructive hover:bg-card',
            )}
          >
            <Heart size={18} className={liked ? 'fill-current' : ''} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm text-muted-foreground hover:text-primary hover:bg-card shadow-lg flex items-center justify-center transition-all active:scale-[0.98]"
            title="Copy link"
          >
            {copied ? (
              <Check size={16} className="text-primary" />
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
                : 'border-transparent hover:border-border',
            )}
          >
            <img
              src={img}
              alt={`${title} ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedImage !== idx && (
              <div className="absolute inset-0 bg-card/20" />
            )}
          </Button>
        ))}
      </div>

      <ProductImageViewer
        isOpen={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        images={images}
        title={title}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  )
}
