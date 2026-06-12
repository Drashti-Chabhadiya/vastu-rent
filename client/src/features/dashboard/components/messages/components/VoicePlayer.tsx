import { useState, useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '#/lib/utils'

interface VoicePlayerProps {
  src: string
  timeStr?: string
}

export function VoicePlayer({ src, timeStr }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio

    const onLoadedMetadata = () => {
      setDuration(audio.duration)
    }
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((err) => console.error("Audio play failed:", err))
      setIsPlaying(true)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="flex items-center gap-2.5 py-2 px-3.5 bg-white border border-slate-200/80 rounded-2xl w-[260px] shrink-0 shadow-none">
      <button
        onClick={togglePlay}
        className="w-7 h-7 rounded-full bg-[#eef6ec] text-emerald-800 hover:bg-[#dcebd8] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0 border-none outline-none"
      >
        {isPlaying ? <Pause size={11} fill="currentColor" /> : <Play size={11} className="ml-0.5" fill="currentColor" />}
      </button>

      <span className="text-[11px] font-bold text-emerald-800 shrink-0 select-none">
        {formatTime(currentTime || duration || 18)}
      </span>

      <div className="flex-1 flex items-end gap-[1.5px] h-4.5 px-0.5 select-none justify-center">
        {[4, 8, 5, 12, 18, 14, 8, 6, 11, 15, 8, 4, 7, 12, 9, 6].map((h, i) => {
          const pct = currentTime / (duration || 1)
          const active = i / 16 <= pct
          return (
            <div
              key={i}
              style={{ height: `${h * 0.7}px` }}
              className={cn(
                "w-[2px] rounded-full transition-colors duration-150 shrink-0",
                active ? "bg-[#0a6634]" : "bg-slate-200"
              )}
            />
          )
        })}
      </div>

      {timeStr && (
        <span className="text-[9px] text-muted-dark/60 select-none shrink-0 self-end">
          {timeStr}
        </span>
      )}
    </div>
  )
}
