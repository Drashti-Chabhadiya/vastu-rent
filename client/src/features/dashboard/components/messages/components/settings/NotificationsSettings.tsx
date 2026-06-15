import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Switch } from '#/components/ui/switch'
import { toast } from 'sonner'

export function NotificationsSettings() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const val = localStorage.getItem('chat_settings_notifications_sound')
    return val !== 'false'
  })
  const [desktopEnabled, setDesktopEnabled] = useState(() => {
    const val = localStorage.getItem('chat_settings_notifications_desktop')
    return val !== 'false'
  })

  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked)
    localStorage.setItem('chat_settings_notifications_sound', String(checked))
    toast.success(`Sound notifications ${checked ? 'enabled' : 'disabled'}`)
  }

  const handleDesktopToggle = (checked: boolean) => {
    setDesktopEnabled(checked)
    localStorage.setItem('chat_settings_notifications_desktop', String(checked))
    toast.success(`Desktop notifications ${checked ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
      <div className="flex flex-col gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Bell size={12} className="text-primary" /> Audio & Banners
        </h4>

        {/* Sound Notifications switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[80%]">
            <span className="text-[12px] font-bold text-slate-800">
              Alert Sounds
            </span>
            <p className="text-[9px] font-semibold text-slate-400">
              Play sounds on receiving incoming messages.
            </p>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
        </div>

        {/* Push Banner switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[80%]">
            <span className="text-[12px] font-bold text-slate-800">
              Browser Banners
            </span>
            <p className="text-[9px] font-semibold text-slate-400">
              Show desktop notice banners when tab is inactive.
            </p>
          </div>
          <Switch
            checked={desktopEnabled}
            onCheckedChange={handleDesktopToggle}
          />
        </div>
      </div>
    </div>
  )
}
