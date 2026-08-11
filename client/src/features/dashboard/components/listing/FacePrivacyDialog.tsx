import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import { useUploadProductImage } from '#/hook'
import { Loader } from '#/components/ui/loader'
import { Slider } from '#/components/ui/slider'
import EmojiPicker from 'emoji-picker-react'
import { toast } from 'sonner'
import { Move, Scaling, Trash2, Plus } from 'lucide-react'

interface FacePrivacyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  faces: number[][] // Cloudinary returns faces as [[x, y, w, h]]
  onConfirm: (finalUrl: string) => void
}

export const FacePrivacyDialog = ({
  open,
  onOpenChange,
  imageUrl,
  faces,
  onConfirm,
}: FacePrivacyDialogProps) => {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const { mutateAsync: uploadImage, isPending: isUploading } =
    useUploadProductImage()

  // Emoji state
  const [emojis, setEmojis] = useState<
    { id: string; x: number; y: number; size: number; char: string }[]
  >([])
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  // Initialize canvas with image
  useEffect(() => {
    if (!open || !imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous' // Required to export canvas data later
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      setCanvasSize({ width: img.width, height: img.height })
      setEmojis([]) // Start empty (Original image)
      setSelectedEmojiId(null)
    }
  }, [open, imageUrl])

  const handleAddEmoji = (char: string) => {
    if (emojis.length === 0 && faces && faces.length > 0) {
      // Auto-place on all detected faces
      const newEmojis = faces.map((face, index) => {
        const [x, y, w, h] = face
        return {
          id: `emoji-${Date.now()}-${index}`,
          x: x + w / 2,
          y: y + h / 2,
          size: Math.max(w, h) * 1.5,
          char: char,
        }
      })
      setEmojis(newEmojis)
      setSelectedEmojiId(newEmojis[0].id)
    } else {
      // Add a new emoji near the center
      const newEmoji = {
        id: `emoji-${Date.now()}`,
        x: canvasSize.width / 2 + (Math.random() * 50 - 25), // slight offset
        y: canvasSize.height / 2 + (Math.random() * 50 - 25),
        size: Math.min(canvasSize.width, canvasSize.height) * 0.2,
        char: char,
      }
      setEmojis([...emojis, newEmoji])
      setSelectedEmojiId(newEmoji.id)
    }
  }

  const handleDeleteEmoji = () => {
    if (!selectedEmojiId) return
    const newEmojis = emojis.filter((e) => e.id !== selectedEmojiId)
    setEmojis(newEmojis)
    setSelectedEmojiId(
      newEmojis.length > 0 ? newEmojis[newEmojis.length - 1].id : null,
    )
  }

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imageRef.current || canvasSize.width === 0) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

    // Draw emojis
    emojis.forEach((emoji) => {
      ctx.font = `${emoji.size}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (selectedEmojiId === emoji.id) {
        // Add a subtle highlight to selected emoji
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 10
      } else {
        ctx.shadowBlur = 0
      }

      ctx.fillText(emoji.char, emoji.x, emoji.y)
      ctx.shadowBlur = 0 // Reset
    })
  }, [emojis, canvasSize, selectedEmojiId])

  // Mouse / Touch Event Handlers
  const getMousePos = (
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    // Calculate scale between displayed size and actual canvas size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e)

    // Check if clicked inside any emoji (reverse order to pick top-most)
    for (let i = emojis.length - 1; i >= 0; i--) {
      const emoji = emojis[i]
      // Simple bounding box collision detection
      const radius = emoji.size / 2
      if (
        pos.x >= emoji.x - radius &&
        pos.x <= emoji.x + radius &&
        pos.y >= emoji.y - radius &&
        pos.y <= emoji.y + radius
      ) {
        setSelectedEmojiId(emoji.id)
        setIsDragging(true)
        setDragOffset({ x: pos.x - emoji.x, y: pos.y - emoji.y })
        return
      }
    }
    setSelectedEmojiId(null)
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selectedEmojiId) return
    e.preventDefault() // Prevent scrolling on touch

    const pos = getMousePos(e)
    setEmojis(
      emojis.map((emoji) => {
        if (emoji.id === selectedEmojiId) {
          return { ...emoji, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
        }
        return emoji
      }),
    )
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Handle Save
  const handleSave = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        try {
          const file = new File([blob], 'edited-image.jpg', {
            type: 'image/jpeg',
          })
          const newUrl = await uploadImage(file)
          onConfirm(newUrl)
        } catch (error) {
          toast.error(t('Failed to save edited image'))
        }
      },
      'image/jpeg',
      0.9,
    )
  }

  const handleSizeChange = (val: number[]) => {
    if (!selectedEmojiId) return
    const newSize = val[0]
    setEmojis(
      emojis.map((emoji) =>
        emoji.id === selectedEmojiId ? { ...emoji, size: newSize } : emoji,
      ),
    )
  }

  const selectedEmoji = emojis.find((e) => e.id === selectedEmojiId)

  const emojiOptions = ['😎', '🤡', '😷', '😁', '❤️', '👽']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-full sm:w-full sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl p-4 sm:p-6">
        <DialogTitle className="text-center text-lg sm:text-xl font-bold px-8">
          {t('Interactive Face Privacy')}
        </DialogTitle>
        <div className="flex flex-col gap-3 py-2 items-center w-full min-w-0">
          <p className="text-xs sm:text-sm text-center text-muted-foreground flex flex-wrap items-center justify-center gap-1.5 w-full">
            <Move size={14} className="shrink-0" />
            <span>{t('Click an emoji to add it, then drag to place it!')}</span>
          </p>

          <div className="flex items-center gap-2 mb-1 relative w-full overflow-x-auto pb-2 justify-start sm:justify-center px-1">
            {emojiOptions.map((char) => (
              <Button
                key={char}
                variant="outline"
                size="sm"
                className="text-xl h-12 w-12 shrink-0 p-0 rounded-full"
                onClick={() => handleAddEmoji(char)}
              >
                {char}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            >
              <Plus size={20} />
            </Button>

            {isEmojiPickerOpen && (
              <div className="absolute top-14 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50 shadow-xl rounded-lg overflow-hidden bg-background border">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    handleAddEmoji(emojiData.emoji)
                    setIsEmojiPickerOpen(false)
                  }}
                  autoFocusSearch={false}
                />
              </div>
            )}
          </div>

          <div
            ref={containerRef}
            className="relative w-full max-w-full overflow-hidden rounded-lg border shadow-sm flex items-center justify-center touch-none bg-muted"
            style={{ maxHeight: '45vh' }}
          >
            {canvasSize.width === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="max-w-full max-h-[45vh] object-contain cursor-move touch-none"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                onTouchCancel={handlePointerUp}
              />
            )}
          </div>

          {selectedEmoji && (
            <div className="flex items-center gap-4 w-full px-2 max-w-xs mt-1">
              <Scaling size={16} className="text-muted-foreground shrink-0" />
              <Slider
                value={[selectedEmoji.size]}
                min={20}
                max={Math.max(canvasSize.width, canvasSize.height) * 0.8}
                step={5}
                onValueChange={handleSizeChange}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0 h-10 w-10 rounded-full"
                onClick={handleDeleteEmoji}
                title={t('Delete Emoji')}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center mt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="outline"
            onClick={() => onConfirm(imageUrl)}
            disabled={isUploading}
            className="w-full sm:w-auto order-2 sm:order-2"
          >
            {t('Keep Original')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || canvasSize.width === 0}
            className="w-full sm:w-auto order-1 sm:order-3"
          >
            {isUploading ? <Loader size={16} className="mr-2" /> : null}
            {t('Save Image')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
