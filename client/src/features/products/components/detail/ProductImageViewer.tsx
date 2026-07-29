import { useRef, useCallback, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { useImageZoom } from './use-image-zoom'
import { useImageSwipe } from './use-image-swipe'

interface ProductImageViewerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  title: string
  selectedImage: number
  setSelectedImage: (idx: number) => void
}

export const ProductImageViewer = ({
  isOpen,
  onOpenChange,
  images,
  title,
  selectedImage,
  setSelectedImage,
}: ProductImageViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef<number>(0)

  const zoom = useImageZoom(containerRef, isOpen)
  const swipe = useImageSwipe({
    selectedImage,
    imagesLength: images.length,
    onNavigate: setSelectedImage,
    dragStartRef: zoom.dragStartRef,
  })

  const handleClose = useCallback(() => {
    zoom.resetZoom()
    swipe.resetSwipeState()
    onOpenChange(false)
  }, [onOpenChange, zoom.resetZoom, swipe.resetSwipeState])

  const handlePrev = useCallback(() => {
    zoom.resetZoom()
    swipe.resetSwipeState()
    setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)
  }, [
    selectedImage,
    images.length,
    setSelectedImage,
    zoom.resetZoom,
    swipe.resetSwipeState,
  ])

  const handleNext = useCallback(() => {
    zoom.resetZoom()
    swipe.resetSwipeState()
    setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)
  }, [
    selectedImage,
    images.length,
    setSelectedImage,
    zoom.resetZoom,
    swipe.resetSwipeState,
  ])

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!zoom.isDragging) return
      if (zoom.scale > 1) {
        zoom.handleDragMovePan(clientX, clientY)
      } else {
        swipe.handleDragMoveSwipe(clientX, clientY)
      }
    },
    [
      zoom.isDragging,
      zoom.scale,
      zoom.handleDragMovePan,
      swipe.handleDragMoveSwipe,
    ],
  )

  const handleDragEnd = useCallback(
    (clientX: number, clientY: number) => {
      if (!zoom.isDragging) return
      zoom.setIsDragging(false)
      if (swipe.isDraggingSwipe) {
        swipe.handleDragEndSwipe(clientX, clientY)
      } else if (swipe.isDraggingSwipeDown) {
        const shouldClose = swipe.handleDragEndSwipeDown(clientX, clientY)
        if (shouldClose) handleClose()
      } else {
        swipe.resetSwipeState()
      }
    },
    [
      zoom.isDragging,
      zoom.setIsDragging,
      swipe.isDraggingSwipe,
      swipe.isDraggingSwipeDown,
      swipe.handleDragEndSwipe,
      swipe.handleDragEndSwipeDown,
      swipe.resetSwipeState,
      handleClose,
    ],
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      zoom.handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
    } else if (e.touches.length === 2) {
      swipe.resetSwipeState()
      zoom.handlePinchStart(e.touches)
    }
  }

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (zoom.isPinching && e.touches.length === 2) {
        zoom.handlePinchMove(e.touches)
      } else if (zoom.isDragging && e.touches.length === 1) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    },
    [zoom.isPinching, zoom.isDragging, zoom.handlePinchMove, handleDragMove],
  )

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoom.isPinching) {
      if (e.touches.length === 0) {
        zoom.setIsPinching(false)
        if (zoom.scale < 0.85) {
          handleClose()
        } else {
          zoom.resetZoom()
          swipe.resetSwipeState()
        }
      } else if (e.touches.length === 1) {
        zoom.setIsPinching(false)
        zoom.handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
      }
    } else if (zoom.isDragging) {
      if (e.changedTouches.length === 1) {
        handleDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      } else {
        zoom.setIsDragging(false)
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    zoom.handleDragStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    handleDragEnd(e.clientX, e.clientY)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    zoom.handleDoubleTap(e.clientX, e.clientY)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    const now = Date.now()
    const DOUBLE_PRESS_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      zoom.handleDoubleTap(e.clientX, e.clientY)
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNext()
          break
        case 'ArrowLeft':
          handlePrev()
          break
        case 'Escape':
          handleClose()
          break
        case '+':
        case '=':
          zoom.handleZoomIn()
          break
        case '-':
          zoom.handleZoomOut()
          break
        case '0':
          zoom.resetZoom()
          swipe.resetSwipeState()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    handleNext,
    handlePrev,
    zoom.handleZoomIn,
    zoom.handleZoomOut,
    zoom.resetZoom,
    swipe.resetSwipeState,
    handleClose,
  ])

  let backdropOpacity = 0.9
  if (zoom.scale < 1) {
    backdropOpacity = Math.max(0.15, 0.9 - (1 - zoom.scale) * 1.8)
  } else if (swipe.dragY > 0) {
    backdropOpacity = Math.max(0.1, 0.9 - (swipe.dragY / 350) * 0.8)
  }

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogPrimitive.Portal>
        <style>{`
          @keyframes viewer-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes viewer-zoom-in {
            from { transform: scale(0.96); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-viewer-fade {
            animation: viewer-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-viewer-zoom {
            animation: viewer-zoom-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-transparent" />

        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-between outline-none select-none overflow-hidden text-white animate-viewer-fade"
          aria-describedby={undefined}
        >
          <div
            className="absolute inset-0 -z-10 transition-colors duration-150 ease-out"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
              backdropFilter: `blur(${Math.max(0, 10 * (backdropOpacity / 0.9))}px)`,
            }}
          />

          <div className="w-full flex items-center justify-between p-4 z-50 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex flex-col">
              <DialogPrimitive.Title className="text-base font-semibold max-w-[200px] sm:max-w-md truncate text-white/90">
                {title}
              </DialogPrimitive.Title>
              <span className="text-xs text-white/50">
                Image {selectedImage + 1} of {images.length}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-1 rounded hidden sm:inline">
                {Math.round(zoom.scale * 100)}%
              </span>
              <button
                onClick={zoom.handleZoomOut}
                disabled={zoom.scale === 1}
                className="p-2 hover:bg-white/10 rounded-full transition disabled:opacity-40 disabled:hover:bg-transparent"
                title="Zoom Out (-)"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => {
                  zoom.resetZoom()
                  swipe.resetSwipeState()
                }}
                disabled={
                  zoom.scale === 1 &&
                  zoom.position.x === 0 &&
                  zoom.position.y === 0
                }
                className="p-2 hover:bg-white/10 rounded-full transition disabled:opacity-40 disabled:hover:bg-transparent"
                title="Reset Zoom (0)"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={zoom.handleZoomIn}
                disabled={zoom.scale === 4}
                className="p-2 hover:bg-white/10 rounded-full transition disabled:opacity-40 disabled:hover:bg-transparent"
                title="Zoom In (+)"
              >
                <ZoomIn size={18} />
              </button>

              <div className="w-[1px] h-6 bg-white/20 mx-1 sm:mx-2" />

              <DialogPrimitive.Close
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition"
                title="Close (Esc)"
              >
                <X size={20} />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div
            ref={containerRef}
            className={cn(
              'relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-grab animate-viewer-zoom',
              zoom.isDragging && 'cursor-grabbing',
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleContainerClick}
            onDoubleClick={handleDoubleClick}
          >
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white/80 hover:text-white transition active:scale-95 hidden sm:flex"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div
              className="absolute inset-0 flex h-full items-center"
              style={{
                width: `${images.length * 100}%`,
                transform: `translate3d(calc(${-selectedImage * (100 / images.length)}% + ${swipe.swipeOffset}px), 0, 0)`,
                transition: swipe.isDraggingSwipe
                  ? 'none'
                  : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {images.map((img, idx) => {
                const isActive = idx === selectedImage
                return (
                  <div
                    key={idx}
                    className="h-full flex items-center justify-center pointer-events-none"
                    style={{ width: `${100 / images.length}%` }}
                  >
                    <div
                      style={
                        isActive
                          ? {
                              transform: `translate3d(${zoom.position.x}px, ${zoom.position.y + swipe.dragY}px, 0) scale(${zoom.scale})`,
                              transition:
                                (zoom.isDragging &&
                                  !swipe.isDraggingSwipe &&
                                  !swipe.isDraggingSwipeDown) ||
                                zoom.isPinching
                                  ? 'none'
                                  : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            }
                          : undefined
                      }
                      className="relative w-full h-full max-w-[90vw] max-h-[72vh] flex items-center justify-center pointer-events-none"
                    >
                      <img
                        src={img}
                        alt={title}
                        className="max-w-full max-h-full object-contain pointer-events-none select-none shadow-2xl rounded"
                        draggable={false}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white/80 hover:text-white transition active:scale-95 hidden sm:flex"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="w-full bg-gradient-to-t from-black/80 to-transparent p-4 pb-6 z-50 flex flex-col items-center gap-3">
              <span className="text-xs text-white/40 sm:hidden">
                Swipe left/right to change • Drag down or pinch to close
              </span>
              <div className="flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-thin scrollbar-thumb-white/20 justify-start sm:justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      zoom.resetZoom()
                      swipe.resetSwipeState()
                      setSelectedImage(idx)
                    }}
                    className={cn(
                      'relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 p-0',
                      selectedImage === idx
                        ? 'border-brand scale-105 shadow-lg shadow-black/50'
                        : 'border-transparent opacity-40 hover:opacity-80',
                    )}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
