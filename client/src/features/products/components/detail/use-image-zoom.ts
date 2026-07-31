import { useState, useRef, useCallback, useEffect } from 'react'

export function useImageZoom(
  containerRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isPinching, setIsPinching] = useState(false)

  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionStartRef = useRef({ x: 0, y: 0 })

  const initialPinchDistanceRef = useRef(0)
  const initialScaleRef = useRef(1)
  const initialPinchMidpointRef = useRef({ x: 0, y: 0 })
  const initialPinchOffsetRef = useRef({ x: 0, y: 0 })

  const getConstraints = useCallback(
    (currentScale: number) => {
      if (!containerRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
      const rect = containerRef.current.getBoundingClientRect()
      const maxX = Math.max(0, (rect.width * (currentScale - 1)) / 2)
      const maxY = Math.max(0, (rect.height * (currentScale - 1)) / 2)
      return { minX: -maxX, maxX, minY: -maxY, maxY }
    },
    [containerRef],
  )

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val))

  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
    setIsPinching(false)
  }, [])

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

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      dragStartRef.current = { x: clientX, y: clientY }
      positionStartRef.current = { ...position }
      setIsDragging(true)
    },
    [position],
  )

  const handleDragMovePan = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return
      const dx = clientX - dragStartRef.current.x
      const dy = clientY - dragStartRef.current.y
      const targetX = positionStartRef.current.x + dx
      const targetY = positionStartRef.current.y + dy
      const bounds = getConstraints(scale)
      setPosition({
        x: clamp(targetX, bounds.minX, bounds.maxX),
        y: clamp(targetY, bounds.minY, bounds.maxY),
      })
    },
    [isDragging, scale, getConstraints],
  )

  const handleDoubleTap = useCallback(
    (clientX: number, clientY: number) => {
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
    },
    [scale, containerRef, getConstraints, resetZoom],
  )

  const handlePinchStart = useCallback(
    (touches: React.TouchList) => {
      setIsDragging(false)
      setIsPinching(true)
      const t1 = touches[0]
      const t2 = touches[1]
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      initialPinchDistanceRef.current = dist
      initialScaleRef.current = scale
      const midX = (t1.clientX + t2.clientX) / 2
      const midY = (t1.clientY + t2.clientY) / 2
      initialPinchMidpointRef.current = { x: midX, y: midY }
      initialPinchOffsetRef.current = { ...position }
    },
    [scale, position],
  )

  const handlePinchMove = useCallback(
    (touches: React.TouchList) => {
      if (!isPinching) return
      const t1 = touches[0]
      const t2 = touches[1]
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      if (initialPinchDistanceRef.current === 0) return
      const newScale = clamp(
        initialScaleRef.current * (dist / initialPinchDistanceRef.current),
        0.6,
        4,
      )
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const midX = (t1.clientX + t2.clientX) / 2
      const midY = (t1.clientY + t2.clientY) / 2
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
      if (newScale < 1) {
        setPosition({ x: 0, y: 0 })
      } else {
        setPosition({
          x: clamp(targetX, bounds.minX, bounds.maxX),
          y: clamp(targetY, bounds.minY, bounds.maxY),
        })
      }
    },
    [isPinching, containerRef, getConstraints],
  )

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
    return () => container.removeEventListener('wheel', handleWheel)
  }, [isOpen, getConstraints, containerRef])

  return {
    scale,
    position,
    setPosition,
    isDragging,
    setIsDragging,
    isPinching,
    setIsPinching,
    dragStartRef,
    resetZoom,
    handleZoomIn,
    handleZoomOut,
    handleDoubleTap,
    getConstraints,
    clamp,
    handleDragStart,
    handleDragMovePan,
    handlePinchStart,
    handlePinchMove,
  }
}
