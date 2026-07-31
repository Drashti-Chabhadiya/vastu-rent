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
import { useState, useRef, useEffect } from 'react'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)
  const programmaticScrollTimeout = useRef<any>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) {
      return
    }
    const container = e.currentTarget
    const scrollLeft = container.scrollLeft
    const width = container.clientWidth
    if (width > 0) {
      const activeIdx = Math.round(scrollLeft / width)
      if (
        activeIdx !== selectedImage &&
        activeIdx >= 0 &&
        activeIdx < images.length
      ) {
        setSelectedImage(activeIdx)
      }
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const targetScrollLeft = selectedImage * container.clientWidth
      if (Math.abs(container.scrollLeft - targetScrollLeft) > 5) {
        isProgrammaticScroll.current = true
        if (programmaticScrollTimeout.current) {
          clearTimeout(programmaticScrollTimeout.current)
        }
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        })
        programmaticScrollTimeout.current = setTimeout(() => {
          isProgrammaticScroll.current = false
        }, 500)
      }
    }
  }, [selectedImage])

  useEffect(() => {
    return () => {
      if (programmaticScrollTimeout.current) {
        clearTimeout(programmaticScrollTimeout.current)
      }
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setHoverPos({ x, y })
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] rounded-none rounded-b-[30px] md:rounded-2xl overflow-hidden bg-card border-x-0 border-t-0 md:border border-border/30 md:shadow-sm group">
        {/* Back button on mobile */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            window.history.back()
          }}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-card/95 backdrop-blur-md border-none flex items-center justify-center cursor-pointer text-foreground hover:bg-card shrink-0 transition-all md:hidden shadow-md active:scale-95"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Scrollable Swipe Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onClick={() => setIsViewerOpen(true)}
          className="flex w-full h-full overflow-x-auto overflow-y-hidden scrollbar-none snap-x snap-mandatory cursor-zoom-in"
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="w-full h-full shrink-0 snap-center relative"
              onMouseEnter={() => idx === selectedImage && setIsHovered(true)}
              onMouseLeave={() => idx === selectedImage && setIsHovered(false)}
              onMouseMove={idx === selectedImage ? handleMouseMove : undefined}
            >
              <img
                src={img}
                alt={`${title} ${idx + 1}`}
                style={{
                  transformOrigin:
                    isHovered && idx === selectedImage
                      ? `${hoverPos.x}% ${hoverPos.y}%`
                      : 'center',
                }}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-300 ease-out pointer-events-none',
                  isHovered && idx === selectedImage
                    ? 'scale-175'
                    : 'scale-100',
                )}
              />
            </div>
          ))}
        </div>

        {/* Mobile dot pagination overlay */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:hidden">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  selectedImage === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/60',
                )}
              />
            ))}
          </div>
        )}

        {/* Zoom Overlay Indicator */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl text-foreground font-semibold text-sm flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Maximize2 size={16} />
            <span>Click to zoom</span>
          </div>
        </div>

        {/* Image Navigation Arrows (only show if more than 1 image) */}
        {images.length > 1 && (
          <>
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
          </>
        )}

        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {/* Share button */}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
            className="w-9 h-9 rounded-full bg-card/95 backdrop-blur-md border-none text-muted-foreground hover:text-primary hover:bg-card shadow-md flex items-center justify-center transition-all active:scale-[0.98]"
            title="Copy link"
          >
            {copied ? (
              <Check size={16} className="text-primary" />
            ) : (
              <Share2 size={16} />
            )}
          </Button>

          {/* Heart button */}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              toggleLike()
            }}
            className={cn(
              'w-9 h-9 rounded-full border-none flex items-center justify-center shadow-md transition-all active:scale-[0.98]',
              liked
                ? 'bg-danger text-destructive hover:bg-danger hover:text-destructive'
                : 'bg-card/95 backdrop-blur-md text-muted-foreground hover:text-destructive hover:bg-card',
            )}
          >
            <Heart size={18} className={liked ? 'fill-current' : ''} />
          </Button>
        </div>
      </div>

      {/* Thumbnails (only show if more than 1 image and on desktop) */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
      )}

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
