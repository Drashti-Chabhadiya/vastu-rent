import { useState, useEffect, useRef, useCallback } from 'react'
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
  // Zoom & Pan State
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Premium Gesture States
  const [swipeOffset, setSwipeOffset] = useState(0) // Horizontal swipe when scale = 1
  const [dragY, setDragY] = useState(0) // Vertical swipe-down when scale = 1

  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingSwipe, setIsDraggingSwipe] = useState(false)
  const [isDraggingSwipeDown, setIsDraggingSwipeDown] = useState(false)
  const [isPinching, setIsPinching] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef<number>(0)

  // Gesture Refs
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionStartRef = useRef({ x: 0, y: 0 })

  const initialPinchDistanceRef = useRef(0)
  const initialScaleRef = useRef(1)
  const initialPinchMidpointRef = useRef({ x: 0, y: 0 })
  const initialPinchOffsetRef = useRef({ x: 0, y: 0 })

  // Reset function
  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setSwipeOffset(0)
    setDragY(0)
    setIsDragging(false)
    setIsDraggingSwipe(false)
    setIsDraggingSwipeDown(false)
    setIsPinching(false)
  }, [])

  // Close handler
  const handleClose = useCallback(() => {
    resetZoom()
    onOpenChange(false)
  }, [onOpenChange, resetZoom])

  // Next / Prev Navigation
  const handlePrev = useCallback(() => {
    resetZoom()
    setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)
  }, [selectedImage, images.length, setSelectedImage, resetZoom])

  const handleNext = useCallback(() => {
    resetZoom()
    setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)
  }, [selectedImage, images.length, setSelectedImage, resetZoom])

  // Pan constraint bounds
  const getConstraints = useCallback((currentScale: number) => {
    if (!containerRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    const rect = containerRef.current.getBoundingClientRect()

    // Limits computed so edges don't show black gap when scale > 1
    const maxX = Math.max(0, (rect.width * (currentScale - 1)) / 2)
    const maxY = Math.max(0, (rect.height * (currentScale - 1)) / 2)

    return {
      minX: -maxX,
      maxX,
      minY: -maxY,
      maxY,
    }
  }, [])

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val))

  // Zoom Button controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(4, prev + 0.5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const nextScale = Math.max(1, prev - 0.5)
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 })
      } else {
        setPosition((pos) => {
          const bounds = getConstraints(nextScale)
          return {
            x: clamp(pos.x, bounds.minX, bounds.maxX),
            y: clamp(pos.y, bounds.minY, bounds.maxY),
          }
        })
      }
      return nextScale
    })
  }, [getConstraints])

  // Drag start
  const handleDragStart = (clientX: number, clientY: number) => {
    dragStartRef.current = { x: clientX, y: clientY }
    positionStartRef.current = { ...position }
    setIsDragging(true)
    setIsDraggingSwipe(false)
    setIsDraggingSwipeDown(false)
  }

  // Drag move
  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return

      const dx = clientX - dragStartRef.current.x
      const dy = clientY - dragStartRef.current.y

      if (scale > 1) {
        // Zooms pan behaviors
        const targetX = positionStartRef.current.x + dx
        const targetY = positionStartRef.current.y + dy
        const bounds = getConstraints(scale)

        setPosition({
          x: clamp(targetX, bounds.minX, bounds.maxX),
          y: clamp(targetY, bounds.minY, bounds.maxY),
        })
      } else {
        // scale === 1, decide horizontal swipe vs vertical close
        if (!isDraggingSwipe && !isDraggingSwipeDown) {
          const threshold = 10
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
            setIsDraggingSwipe(true)
          } else if (dy > threshold && dy > Math.abs(dx)) {
            setIsDraggingSwipeDown(true)
          }
        }

        if (isDraggingSwipe) {
          // Horizontal carousel track drag
          let offset = dx
          if (selectedImage === 0 && dx > 0) {
            offset = Math.pow(dx, 0.8) // Edge resistance
          } else if (selectedImage === images.length - 1 && dx < 0) {
            offset = -Math.pow(-dx, 0.8) // Edge resistance
          }
          setSwipeOffset(offset)
        } else if (isDraggingSwipeDown) {
          // Drag down to close
          setDragY(Math.max(0, dy))
        }
      }
    },
    [
      isDragging,
      scale,
      isDraggingSwipe,
      isDraggingSwipeDown,
      selectedImage,
      images.length,
      position,
      getConstraints,
    ],
  )

  // Drag end
  const handleDragEnd = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return
      setIsDragging(false)

      if (isDraggingSwipe) {
        setIsDraggingSwipe(false)
        const dx = clientX - dragStartRef.current.x
        const threshold = 100

        if (dx > threshold && selectedImage > 0) {
          setSelectedImage(selectedImage - 1)
        } else if (dx < -threshold && selectedImage < images.length - 1) {
          setSelectedImage(selectedImage + 1)
        }
        setSwipeOffset(0)
      } else if (isDraggingSwipeDown) {
        setIsDraggingSwipeDown(false)
        const dy = clientY - dragStartRef.current.y

        if (dy > 150) {
          handleClose()
        } else {
          setDragY(0)
        }
      } else {
        setSwipeOffset(0)
        setDragY(0)
      }
    },
    [
      isDragging,
      isDraggingSwipe,
      isDraggingSwipeDown,
      selectedImage,
      images.length,
      setSelectedImage,
      handleClose,
    ],
  )

  // Touch triggers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      handleDragStart(touch.clientX, touch.clientY)
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      setIsDraggingSwipe(false)
      setIsDraggingSwipeDown(false)
      setIsPinching(true)

      const t1 = e.touches[0]
      const t2 = e.touches[1]

      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      initialPinchDistanceRef.current = dist
      initialScaleRef.current = scale

      const midX = (t1.clientX + t2.clientX) / 2
      const midY = (t1.clientY + t2.clientY) / 2
      initialPinchMidpointRef.current = { x: midX, y: midY }
      initialPinchOffsetRef.current = { ...position }
    }
  }

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        const t1 = e.touches[0]
        const t2 = e.touches[1]

        const dist = Math.hypot(
          t1.clientX - t2.clientX,
          t1.clientY - t2.clientY,
        )
        if (initialPinchDistanceRef.current === 0) return

        // Pinch to close allows scaling down to 0.6x
        const newScale = clamp(
          initialScaleRef.current * (dist / initialPinchDistanceRef.current),
          0.6,
          4,
        )

        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()

        const midX = (t1.clientX + t2.clientX) / 2
        const midY = (t1.clientY + t2.clientY) / 2

        // Keep zoom target under fingers
        const scaleRatio = newScale / initialScaleRef.current
        const relativeX =
          initialPinchMidpointRef.current.x - rect.left - rect.width / 2
        const relativeY =
          initialPinchMidpointRef.current.y - rect.top - rect.height / 2

        const targetX =
          (initialPinchOffsetRef.current.x - relativeX) * scaleRatio +
          relativeX +
          (midX - initialPinchMidpointRef.current.x)
        const targetY =
          (initialPinchOffsetRef.current.y - relativeY) * scaleRatio +
          relativeY +
          (midY - initialPinchMidpointRef.current.y)

        const bounds = getConstraints(newScale)

        setScale(newScale)

        // If scaling below 1x, reset translations so it centers neatly
        if (newScale < 1) {
          setPosition({ x: 0, y: 0 })
        } else {
          setPosition({
            x: clamp(targetX, bounds.minX, bounds.maxX),
            y: clamp(targetY, bounds.minY, bounds.maxY),
          })
        }
      } else if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0]
        handleDragMove(touch.clientX, touch.clientY)
      }
    },
    [isPinching, isDragging, getConstraints, handleDragMove, scale],
  )

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinching) {
      if (e.touches.length === 0) {
        setIsPinching(false)
        if (scale < 0.85) {
          handleClose()
        } else {
          resetZoom()
        }
      } else if (e.touches.length === 1) {
        setIsPinching(false)
        const touch = e.touches[0]
        handleDragStart(touch.clientX, touch.clientY)
      }
    } else if (isDragging) {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0]
        handleDragEnd(touch.clientX, touch.clientY)
      } else {
        setIsDragging(false)
      }
    }
  }

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    handleDragEnd(e.clientX, e.clientY)
  }

  // Double Click / Double Tap
  const handleDoubleTap = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    if (scale > 1) {
      resetZoom()
    } else {
      const rect = containerRef.current.getBoundingClientRect()
      const tapX = clientX - rect.left
      const tapY = clientY - rect.top

      const nextScale = 2.5
      const newX = (rect.width / 2 - tapX) * (nextScale - 1)
      const newY = (rect.height / 2 - tapY) * (nextScale - 1)

      const bounds = getConstraints(nextScale)
      setScale(nextScale)
      setPosition({
        x: clamp(newX, bounds.minX, bounds.maxX),
        y: clamp(newY, bounds.minY, bounds.maxY),
      })
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    handleDoubleTap(e.clientX, e.clientY)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    const now = Date.now()
    const DOUBLE_PRESS_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      handleDoubleTap(e.clientX, e.clientY)
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }
  }

  // Mouse Wheel Zoom
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isOpen) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.25 : 0.25

      setScale((currentScale) => {
        const nextScale = clamp(currentScale + delta, 0.8, 4)
        if (nextScale === currentScale) return currentScale

        const rect = container.getBoundingClientRect()
        const cursorX = e.clientX - rect.left - rect.width / 2
        const cursorY = e.clientY - rect.top - rect.height / 2

        const scaleRatio = nextScale / currentScale

        setPosition((pos) => {
          const targetX = (pos.x - cursorX) * scaleRatio + cursorX
          const targetY = (pos.y - cursorY) * scaleRatio + cursorY
          const bounds = getConstraints(nextScale)

          if (nextScale < 1) return { x: 0, y: 0 }
          return {
            x: clamp(targetX, bounds.minX, bounds.maxX),
            y: clamp(targetY, bounds.minY, bounds.maxY),
          }
        })

        return nextScale
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen, getConstraints])

  // Keyboard controls
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
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          resetZoom()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    isOpen,
    handleNext,
    handlePrev,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    handleClose,
  ])

  // Dynamic physics-based overlay opacity and blur calculations
  let backdropOpacity = 0.9
  if (scale < 1) {
    backdropOpacity = Math.max(0.15, 0.9 - (1 - scale) * 1.8)
  } else if (dragY > 0) {
    backdropOpacity = Math.max(0.1, 0.9 - (dragY / 350) * 0.8)
  }

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogPrimitive.Portal>
        {/* Style block inject for smooth, custom opening transitions */}
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
          {/* Physics Dimmed Backdrop */}
          <div
            className="absolute inset-0 -z-10 transition-colors duration-150 ease-out"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
              backdropFilter: `blur(${Math.max(0, 10 * (backdropOpacity / 0.9))}px)`,
            }}
          />

          {/* Header Bar */}
          <div className="w-full flex items-center justify-between p-4 z-50 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex flex-col">
              <DialogPrimitive.Title className="text-base font-semibold max-w-[200px] sm:max-w-md truncate text-white/90">
                {title}
              </DialogPrimitive.Title>
              <span className="text-xs text-white/50">
                Image {selectedImage + 1} of {images.length}
              </span>
            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-1 rounded hidden sm:inline">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomOut}
                disabled={scale === 1}
                className="p-2 hover:bg-white/10 rounded-full transition disabled:opacity-40 disabled:hover:bg-transparent"
                title="Zoom Out (-)"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={resetZoom}
                disabled={scale === 1 && position.x === 0 && position.y === 0}
                className="p-2 hover:bg-white/10 rounded-full transition disabled:opacity-40 disabled:hover:bg-transparent"
                title="Reset Zoom (0)"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={scale === 4}
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

          {/* Touch Viewport Container */}
          <div
            ref={containerRef}
            className={cn(
              'relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-grab animate-viewer-zoom',
              isDragging && 'cursor-grabbing',
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
            {/* Previous slide arrow (only visible if more than 1 image) */}
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

            {/* Multi-image Horizontal Swipe Carousel Track */}
            <div
              className="absolute inset-0 flex h-full items-center"
              style={{
                width: `${images.length * 100}%`,
                transform: `translate3d(calc(${-selectedImage * (100 / images.length)}% + ${swipeOffset}px), 0, 0)`,
                transition: isDraggingSwipe
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
                    {/* Only the active image slide translates/zooms/drags-down */}
                    <div
                      style={
                        isActive
                          ? {
                              transform: `translate3d(${position.x}px, ${position.y + dragY}px, 0) scale(${scale})`,
                              transition:
                                (isDragging &&
                                  !isDraggingSwipe &&
                                  !isDraggingSwipeDown) ||
                                isPinching
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

            {/* Next slide arrow (only visible if more than 1 image) */}
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

          {/* Footer Slide Picker (only visible if more than 1 image) */}
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
                      resetZoom()
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
