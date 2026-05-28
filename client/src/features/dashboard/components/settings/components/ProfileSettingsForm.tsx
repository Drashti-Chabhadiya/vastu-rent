import { Upload } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

interface ProfileSettingsFormProps {
  profileName: string
  setProfileName: (name: string) => void
  profileImage: string
  setProfileImage: (image: string) => void
  isSavingProfile: boolean
  activeUser: { email?: string; name?: string } | undefined
  handleSaveProfile: (e: React.FormEvent) => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ProfileSettingsForm = ({
  profileName,
  setProfileName,
  profileImage,
  setProfileImage,
  isSavingProfile,
  activeUser,
  handleSaveProfile,
  handleImageUpload,
}: ProfileSettingsFormProps) => {
  return (
    <form onSubmit={handleSaveProfile} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-black text-foreground/90">
            Profile Settings
          </h3>
          <p className="text-[11px] font-bold text-muted-dark">
            Update your public profile and avatar.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSavingProfile}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground font-black text-[11px] px-6 h-11 rounded-full transition-all shadow-md shadow-dash-brand/10 active:scale-95 cursor-pointer"
        >
          {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Avatar Uploader Section */}
      <div className="flex items-center gap-6 p-6 rounded-2xl bg-muted-light/50 border border-border/30">
        <div className="w-20 h-20 rounded-full border-2 border-card overflow-hidden shadow-md bg-muted shrink-0 relative group">
          {profileImage ? (
            <img
              src={profileImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-extrabold text-muted-foreground/85 uppercase text-lg">
              {profileName.slice(0, 2) || 'US'}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-black text-foreground/90">
            Profile Photo
          </h4>
          <p className="text-[10px] font-semibold text-muted-dark">
            Upload high-res JPG, PNG (Max 5MB)
          </p>

          <div className="flex gap-2">
            <label className="h-9 px-4 rounded-full bg-card border border-border hover:bg-muted-light text-muted-foreground text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all">
              <Upload size={12} /> Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {profileImage && (
              <Button
                type="button"
                onClick={() => setProfileImage('')}
                variant="ghost"
                className="h-9 px-3 rounded-full text-destructive hover:bg-danger text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Text Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
            Full Name
          </label>
          <Input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Enter your name"
            className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-black text-foreground px-5 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
            Email Address
          </label>
          <Input
            value={activeUser?.email || ''}
            disabled
            className="h-12 bg-muted/50 border-none rounded-2xl text-[12px] font-black text-muted-dark px-5 cursor-not-allowed"
          />
        </div>
      </div>
    </form>
  )
}
