import { useState, useRef, useEffect } from 'react'
import { Camera, User, Info, Check, X, Pencil } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { authClient } from '#/lib/auth/auth-client'
import { useUploadProfileImage, useUpdateUserSettings } from '#/hook'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ProfileSettingsProps {
  user: any
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadProfileImage()
  const { mutateAsync: updateSettings } = useUpdateUserSettings()

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioValue, setBioValue] = useState('')

  useEffect(() => {
    if (user) {
      setNameValue(user.name || '')
      setBioValue(user.bio || 'Hey there! I am using VastuRent.')
    }
  }, [user])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await uploadImage(file)
        await queryClient.invalidateQueries({ queryKey: ['session'] })
        toast.success('Profile avatar updated successfully!')
      } catch (err: any) {
        toast.error(err?.message || 'Failed to upload image')
      }
    }
  }

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    try {
      await authClient.updateUser({
        name: nameValue.trim(),
      })
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      setIsEditingName(false)
      toast.success('Username updated successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update username')
    }
  }

  const handleSaveBio = async () => {
    try {
      await updateSettings({
        bio: bioValue.trim(),
      })
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      setIsEditingBio(false)
      toast.success('About status updated!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update about status')
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-in slide-in-from-right-5 duration-200">
      <div className="flex flex-col items-center gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
        {/* Avatar Upload Container */}
        <div
          className="relative group cursor-pointer"
          onClick={handleImageClick}
        >
          <div className="relative w-24 h-24 rounded-full overflow-hidden border border-slate-200/80 shadow-md flex items-center justify-center bg-slate-100">
            {isUploadingImage ? (
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white">
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              </div>
            ) : user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-slate-500 uppercase">
                {user.name.charAt(0)}
              </span>
            )}
            {/* Photo Change Indicator overlay */}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold tracking-wider">
              <Camera size={18} className="mb-0.5" />
              CHANGE
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Edit Username Field */}
        <div className="w-full space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <User size={10} /> Profile Username
          </label>
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="h-8 text-[12px] font-bold px-2.5 rounded-lg border-slate-200 bg-white"
                placeholder="Enter name..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <Button
                onClick={handleSaveName}
                size="icon"
                className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-none cursor-pointer"
              >
                <Check size={14} strokeWidth={2.5} />
              </Button>
              <Button
                onClick={() => {
                  setNameValue(user.name || '')
                  setIsEditingName(false)
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-[13px] font-bold text-slate-800 truncate pr-2">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingName(true)}
                className="h-6 w-6 rounded-md text-slate-400 hover:bg-slate-100 shrink-0 cursor-pointer"
              >
                <Pencil size={11} />
              </Button>
            </div>
          )}
        </div>

        {/* Edit Bio Field */}
        <div className="w-full space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Info size={10} /> About status
          </label>
          {isEditingBio ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={bioValue}
                onChange={(e) => setBioValue(e.target.value)}
                className="h-8 text-[12px] font-bold px-2.5 rounded-lg border-slate-200 bg-white"
                placeholder="Enter status..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveBio()}
              />
              <Button
                onClick={handleSaveBio}
                size="icon"
                className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-none cursor-pointer"
              >
                <Check size={14} strokeWidth={2.5} />
              </Button>
              <Button
                onClick={() => {
                  setBioValue(user.bio || 'Hey there! I am using VastuRent.')
                  setIsEditingBio(false)
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 truncate pr-2">
                {bioValue}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingBio(true)}
                className="h-6 w-6 rounded-md text-slate-400 hover:bg-slate-100 shrink-0 cursor-pointer"
              >
                <Pencil size={11} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
