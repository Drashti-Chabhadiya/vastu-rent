import { Wallpaper } from 'lucide-react'
import { Switch } from '#/components/ui/switch'
import { useChatStore } from '../../../../../../store/useChatStore'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'

export function ChatsSettings() {
  const { chatWallpaper, setChatWallpaper, hideMedia, setHideMedia } =
    useChatStore()

  const handleWallpaperChange = (themeName: string) => {
    setChatWallpaper(themeName)
    toast.success(`Theme set to ${themeName}`)
  }

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
      {/* Wallpaper selection */}
      <div className="flex flex-col gap-3 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Wallpaper size={12} className="text-primary" /> Chat Theme
        </h4>
        <p className="text-[9px] font-semibold text-slate-400">
          Choose a wallpaper color scheme:
        </p>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {[
            {
              id: 'classic',
              color: 'bg-emerald-500/10 border-emerald-500/20',
            },
            { id: 'dark', color: 'bg-slate-800 border-slate-900' },
            { id: 'blue', color: 'bg-sky-500/15 border-sky-400/20' },
            { id: 'emerald', color: 'bg-teal-500/15 border-teal-400/20' },
            { id: 'sand', color: 'bg-amber-500/10 border-amber-400/20' },
          ].map((wp) => (
            <button
              key={wp.id}
              onClick={() => handleWallpaperChange(wp.id)}
              className={cn(
                'w-9 h-9 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 active:scale-95',
                wp.color,
                chatWallpaper === wp.id
                  ? 'border-primary scale-110 shadow-sm'
                  : 'border-transparent',
              )}
              title={`Wallpaper ${wp.id}`}
            />
          ))}
        </div>
      </div>

      {/* Media visibility switch */}
      <div className="flex flex-col gap-3 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[80%]">
            <span className="text-[12px] font-bold text-slate-800">
              Media Visibility
            </span>
            <p className="text-[9px] font-semibold text-slate-400">
              Auto-hide attachment images/videos.
            </p>
          </div>
          <Switch checked={hideMedia} onCheckedChange={setHideMedia} />
        </div>
      </div>
    </div>
  )
}
