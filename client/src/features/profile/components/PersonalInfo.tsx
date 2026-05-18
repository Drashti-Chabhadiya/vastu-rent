import { useState, useRef, useEffect } from "react"
import { authClient } from "#/lib/auth/auth-client"
import { Button } from "#/components/ui/button"
import { cn } from "#/lib/utils"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Mail, User as UserIcon, Calendar, Camera, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useUploadProfileImage } from "#/hook"

export function PersonalInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutateAsync: uploadImage, isPending: isSaving } = useUploadProfileImage()

  // Fetch session via React Query for consistency
  const { data: session, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  // Synchronize state once session data loads
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  const handleEditClick = () => {
    if (isEditing) {
      setName(session?.user?.name || "")
      setImagePreview(null)
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = async () => {
    try {
      // 1. Update name via better-auth if edited
      if (name.trim() && name.trim() !== session?.user?.name) {
        await authClient.updateUser({
          name: name.trim()
        })
      }

      // 2. Upload image if chosen
      if (fileInputRef.current?.files?.[0]) {
        await uploadImage(fileInputRef.current.files[0])
      }

      await refetch()
      setIsEditing(false)
      setImagePreview(null)
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save changes. Please try again.')
    }
  }

  if (!session) return null

  return (
    <div className="p-8 lg:p-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Personal Information</h1>
          <p className="text-gray-500">Manage your account details and profile settings.</p>
        </div>
        <Button 
          variant={isEditing ? "outline" : "default"}
          onClick={handleEditClick}
          className={cn(
            "rounded-xl font-bold h-11 px-6 transition-all",
            isEditing 
              ? "border-brand bg-primary hover:bg-primary/5" 
              : "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-brand/20"
          )}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-[40px] bg-primary/5 border-4 border-white shadow-xl flex items-center justify-center text-4xl lg:text-6xl font-bold text-primary overflow-hidden relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : session.user.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                session.user.name?.[0]?.toUpperCase() || 'U'
              )}
              {isEditing && (
                <div 
                  onClick={handleImageClick}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={32} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Change Photo</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-gray-900 text-lg">{session.user.name}</h4>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Verified Account</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    "h-12 pl-12 rounded-xl border-gray-100 font-bold transition-all",
                    isEditing 
                      ? "bg-white border-brand ring-2 ring-brand/5 text-gray-900" 
                      : "bg-gray-50/50 text-gray-900 disabled:opacity-100 disabled:cursor-default"
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <Input 
                  id="email" 
                  defaultValue={session.user.email} 
                  disabled
                  className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50/50 disabled:opacity-100 text-gray-900 font-bold disabled:cursor-default"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Member Since</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <Input 
                  defaultValue={new Date(session.user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} 
                  disabled
                  className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50/50 disabled:opacity-100 text-gray-900 font-bold disabled:cursor-default"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-6 border-t border-gray-50 flex gap-4">
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-primary hover:bg-primary-hover text-white h-12 px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand/20"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

