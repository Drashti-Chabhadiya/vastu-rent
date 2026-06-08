import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface ImageEditorModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string | null
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void
}

export const ImageEditorModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageEditorModalProps) => {
  const [scale, setScale] = useState(1)
  const [minScale, setMinScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [fitSize, setFitSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionStartRef = useRef({ x: 0, y: 0 })

  const CONTAINER_SIZE = 320
  const CROP_SIZE = 220

  // Reset states when dialog opens with a new image source
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setMinScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, imageSrc])

  // Fit image to ensure its shorter side fills the container size (320px)
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const w = img.naturalWidth
    const h = img.naturalHeight
    setNaturalSize({ width: w, height: h })

    let fw = CONTAINER_SIZE
    let fh = CONTAINER_SIZE

    if (w > h) {
      fh = CONTAINER_SIZE
      fw = CONTAINER_SIZE * (w / h)
    } else {
      fw = CONTAINER_SIZE
      fh = CONTAINER_SIZE * (h / w)
    }

    setFitSize({ width: fw, height: fh })
    setScale(1)
    setPosition({ x: 0, y: 0 })

    // Calculate minimum scale to let the entire image fit inside the circular crop viewport
    const calculatedMinScale = CROP_SIZE / Math.max(fw, fh)
    setMinScale(Math.max(0.1, calculatedMinScale))
  }

  // Get constraints. If image is smaller than crop area, clamp translation to 0 (snap to center)
  const getConstraints = useCallback((currentScale: number) => {
    const w_r = fitSize.width * currentScale
    const h_r = fitSize.height * currentScale

    const maxX = w_r > CROP_SIZE ? (w_r - CROP_SIZE) / 2 : 0
    const maxY = h_r > CROP_SIZE ? (h_r - CROP_SIZE) / 2 : 0

    return {
      minX: -maxX,
      maxX,
      minY: -maxY,
      maxY,
    }
  }, [fitSize])

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val))

  // Pointer event gesture pan handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    positionStartRef.current = { ...position }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    const targetX = positionStartRef.current.x + dx
    const targetY = positionStartRef.current.y + dy

    const bounds = getConstraints(scale)
    setPosition({
      x: clamp(targetX, bounds.minX, bounds.maxX),
      y: clamp(targetY, bounds.minY, bounds.maxY),
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setIsDragging(false)
  }

  // HTML5 Canvas Cropping Engine using Coordinate Space Transformation Matrix
  const handleSave = () => {
    if (!naturalSize.width || !naturalSize.height || !imageSrc) return

    const canvas = document.createElement('canvas')
    const outputSize = 400
    canvas.width = outputSize
    canvas.height = outputSize

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fill background with white in case image does not cover crop viewport
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outputSize, outputSize)

    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      const canvasScale = outputSize / CROP_SIZE

      ctx.save()

      // Translate center origin of output canvas
      ctx.translate(outputSize / 2, outputSize / 2)

      // Translate panning position in canvas coordinates
      ctx.translate(position.x * canvasScale, position.y * canvasScale)

      // Apply scale multiplier
      ctx.scale(scale * canvasScale, scale * canvasScale)

      // Draw centered raw image
      ctx.drawImage(img, -fitSize.width / 2, -fitSize.height / 2, fitSize.width, fitSize.height)

      ctx.restore()

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob, URL.createObjectURL(blob))
          onClose()
        }
      }, 'image/jpeg', 0.9)
    }
  }

  if (!imageSrc) return null

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity" />

        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-[360px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-3xl duration-200 outline-none select-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-bold text-foreground">
              Edit Profile Picture
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="p-1 hover:bg-muted rounded-full transition text-muted-foreground hover:text-foreground">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>

          <div className="flex flex-col items-center gap-6 mt-2">
            {/* Crop Viewport */}
            <div
              className="relative w-[320px] h-[320px] overflow-hidden bg-muted border border-border/30 rounded-2xl shadow-inner cursor-grab select-none touch-none active:cursor-grabbing flex items-center justify-center"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div
                style={{
                  width: fitSize.width,
                  height: fitSize.height,
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                  transformOrigin: 'center',
                }}
                className="relative flex items-center justify-center pointer-events-none"
              >
                <img
                  src={imageSrc}
                  alt="Avatar Editor"
                  onLoad={handleImageLoad}
                  className="max-w-none max-h-none pointer-events-none select-none"
                  style={{
                    width: fitSize.width,
                    height: fitSize.height,
                  }}
                />
              </div>

              {/* Crop Circular Mask and Dashed overlay */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                <div
                  className="absolute w-[220px] h-[220px] rounded-full border border-white/50 top-[50px] left-[50px] shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
                />
                <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-white/20 top-[50px] left-[50px]" />
                <div className="absolute top-2 left-2 bg-black/40 text-[10px] text-white/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Move size={10} />
                  <span>Drag to reposition</span>
                </div>
              </div>
            </div>

            {/* Slider zoom controls */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                <span>Zoom</span>
                <span>{Math.round(scale * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut size={16} className="text-muted-foreground" />
                <input
                  type="range"
                  min={minScale}
                  max="3"
                  step="0.01"
                  value={scale}
                  onChange={(e) => {
                    const nextScale = parseFloat(e.target.value)
                    setScale(nextScale)
                    const bounds = getConstraints(nextScale)
                    setPosition({
                      x: clamp(position.x, bounds.minX, bounds.maxX),
                      y: clamp(position.y, bounds.minY, bounds.maxY),
                    })
                  }}
                  className="flex-1 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-brand"
                  style={{ background: 'var(--color-border)' }}
                />
                <ZoomIn size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={onClose} className="rounded-xl font-bold flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-xl font-bold flex-1 sm:flex-none bg-brand hover:bg-brand/90 text-brand-foreground">
              Save Crop
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
