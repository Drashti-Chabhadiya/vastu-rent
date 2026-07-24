import { useState, useCallback } from 'react'

interface UseImageSwipeOptions {
  selectedImage: number
  imagesLength: number
  onNavigate: (idx: number) => void
  dragStartRef: React.MutableRefObject<{ x: number; y: number }>
}

export function useImageSwipe({
  selectedImage,
  imagesLength,
  onNavigate,
  dragStartRef,
}: UseImageSwipeOptions) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDraggingSwipe, setIsDraggingSwipe] = useState(false)
  const [isDraggingSwipeDown, setIsDraggingSwipeDown] = useState(false)

  const resetSwipeState = useCallback(() => {
    setSwipeOffset(0)
    setDragY(0)
    setIsDraggingSwipe(false)
    setIsDraggingSwipeDown(false)
  }, [])

  const handleDragMoveSwipe = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - dragStartRef.current.x
      const dy = clientY - dragStartRef.current.y

      if (!isDraggingSwipe && !isDraggingSwipeDown) {
        const threshold = 10
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
          setIsDraggingSwipe(true)
        } else if (dy > threshold && dy > Math.abs(dx)) {
          setIsDraggingSwipeDown(true)
        }
      }

      if (isDraggingSwipe) {
        let offset = dx
        if (selectedImage === 0 && dx > 0) {
          offset = Math.pow(dx, 0.8)
        } else if (selectedImage === imagesLength - 1 && dx < 0) {
          offset = -Math.pow(-dx, 0.8)
        }
        setSwipeOffset(offset)
      } else if (isDraggingSwipeDown) {
        setDragY(Math.max(0, dy))
      }
    },
    [
      isDraggingSwipe,
      isDraggingSwipeDown,
      selectedImage,
      imagesLength,
      dragStartRef,
    ],
  )

  const handleDragEndSwipe = useCallback(
    (clientX: number, _clientY: number) => {
      setIsDraggingSwipe(false)
      const dx = clientX - dragStartRef.current.x
      const threshold = 100
      if (dx > threshold && selectedImage > 0) {
        onNavigate(selectedImage - 1)
      } else if (dx < -threshold && selectedImage < imagesLength - 1) {
        onNavigate(selectedImage + 1)
      }
      setSwipeOffset(0)
    },
    [selectedImage, imagesLength, onNavigate, dragStartRef],
  )

  const handleDragEndSwipeDown = useCallback(
    (_clientX: number, clientY: number): boolean => {
      setIsDraggingSwipeDown(false)
      const dy = clientY - dragStartRef.current.y
      if (dy > 150) {
        return true
      } else {
        setDragY(0)
        return false
      }
    },
    [dragStartRef],
  )

  return {
    swipeOffset,
    dragY,
    isDraggingSwipe,
    isDraggingSwipeDown,
    handleDragMoveSwipe,
    handleDragEndSwipe,
    handleDragEndSwipeDown,
    resetSwipeState,
  }
}