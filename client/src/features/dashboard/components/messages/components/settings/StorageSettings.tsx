import { HardDrive } from 'lucide-react'
import { useChatStore } from '../../../../../../store/useChatStore'

export function StorageSettings() {
  const { messages } = useChatStore()

  // Calculate storage consumption
  const getStorageStats = () => {
    let imageCount = 0
    let audioCount = 0
    let videoCount = 0
    let docCount = 0

    messages.forEach((msg: any) => {
      if (!msg.isDeleted && msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((url: string) => {
          if (url.match(/\.(jpeg|jpg|gif|png|webp)/i)) imageCount++
          else if (url.match(/\.(mp3|wav|ogg|m4a|weba)/i)) audioCount++
          else if (url.match(/\.(mp4|webm|mov|avi)/i)) videoCount++
          else docCount++
        })
      }
    })

    const mediaSize = imageCount * 0.45 + videoCount * 4.2
    const audioSize = audioCount * 0.75
    const docSize = docCount * 1.1
    const totalSize = parseFloat((mediaSize + audioSize + docSize).toFixed(2))
    const limitMB = 15360
    const usedPercent = Math.min(
      parseFloat(((totalSize / limitMB) * 100).toFixed(3)) + 0.05,
      100,
    )

    return {
      totalSize,
      mediaSize: parseFloat(mediaSize.toFixed(2)),
      audioSize: parseFloat(audioSize.toFixed(2)),
      docSize: parseFloat(docSize.toFixed(2)),
      imageCount,
      audioCount,
      videoCount,
      docCount,
      usedPercent,
    }
  }

  const storage = getStorageStats()

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
      <div className="flex flex-col gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <HardDrive size={12} className="text-primary" /> Attachment Sizes
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500">
            <span>{storage.totalSize} MB of 15 GB Used</span>
            <span className="text-primary font-black">
              {storage.usedPercent}%
            </span>
          </div>
          {/* Visual Storage Meter bar */}
          <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 rounded-l-full transition-all"
              style={{
                width: `${Math.max(1, storage.usedPercent * 5)}%`,
              }}
              title="Media"
            />
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${storage.audioCount > 0 ? 5 : 0}%` }}
              title="Audio"
            />
            <div
              className="h-full bg-amber-500 rounded-r-full transition-all"
              style={{ width: `${storage.docCount > 0 ? 4 : 0}%` }}
              title="Documents"
            />
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />{' '}
                Media
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                {storage.mediaSize} MB
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />{' '}
                Audio
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                {storage.audioSize} MB
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />{' '}
                Docs
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                {storage.docSize} MB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
