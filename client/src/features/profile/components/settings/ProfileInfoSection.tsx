import { Camera, Upload } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Loader } from '#/components/ui/loader'
import { cn } from '#/lib/utils'
import { SettingsSectionShell } from './SettingsSectionShell'

interface ProfileInfoSectionProps {
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  location: string
  setLocation: (v: string) => void
  bio: string
  setBio: (v: string) => void
  avatar: string | null
  initials: string
  busy: boolean
  fileRef: React.RefObject<HTMLInputElement | null>
  handleSaveProfile: () => Promise<void>
  setImgPreview: (preview: string | null) => void
  userEmail: string
}

export function ProfileInfoSection({
  name,
  setName,
  phone,
  setPhone,
  location,
  setLocation,
  bio,
  setBio,
  avatar,
  initials,
  busy,
  fileRef,
  handleSaveProfile,
  setImgPreview,
  userEmail,
}: ProfileInfoSectionProps) {
  return (
    <SettingsSectionShell
      title="Profile Information"
      description="Update your personal details and how others see you."
    >
      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-x-6', 'gap-y-5')}>
        <div className="space-y-1.5">
          <Label
            htmlFor="s-name"
            className={cn('text-xs', 'font-semibold', 'text-muted-foreground/85')}
          >
            Full Name
          </Label>
          <Input
            id="s-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              'h-10',
              'rounded-xl',
              'border-border',
              'text-sm',
              'font-medium',
              'focus-visible:ring-1',
              'focus-visible:ring-primary/30',
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="s-email"
            className={cn('text-xs', 'font-semibold', 'text-muted-foreground/85')}
          >
            Email Address
          </Label>
          <Input
            id="s-email"
            value={userEmail}
            disabled
            className={cn(
              'h-10',
              'rounded-xl',
              'border-border',
              'bg-muted-light',
              'text-sm',
              'font-medium',
              'disabled:opacity-100',
              'disabled:cursor-default',
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="s-phone"
            className={cn('text-xs', 'font-semibold', 'text-muted-foreground/85')}
          >
            Phone Number
          </Label>
          <Input
            id="s-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={cn(
              'h-10',
              'rounded-xl',
              'border-border',
              'text-sm',
              'font-medium',
              'focus-visible:ring-1',
              'focus-visible:ring-primary/30',
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="s-loc"
            className={cn('text-xs', 'font-semibold', 'text-muted-foreground/85')}
          >
            Location
          </Label>
          <Input
            id="s-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={cn(
              'h-10',
              'rounded-xl',
              'border-border',
              'text-sm',
              'font-medium',
              'focus-visible:ring-1',
              'focus-visible:ring-primary/30',
            )}
          />
        </div>
        <div className={cn('space-y-1.5', 'sm:col-span-2')}>
          <Label
            htmlFor="s-bio"
            className={cn('text-xs', 'font-semibold', 'text-muted-foreground/85')}
          >
            Bio
          </Label>
          <div className="relative">
            <Textarea
              id="s-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={4}
              placeholder="Tell others a little about yourself..."
              className={cn(
                'rounded-xl',
                'border-border',
                'text-sm',
                'font-medium',
                'resize-none',
                'focus-visible:ring-1',
                'focus-visible:ring-primary/30',
                'pb-7',
              )}
            />
            <span
              className={cn(
                'absolute',
                'bottom-2.5',
                'right-3',
                'text-[10px]',
                'text-muted-foreground/70',
                'font-medium',
                'pointer-events-none',
              )}
            >
              {bio.length}/160
            </span>
          </div>
        </div>
      </div>

      {/* Profile photo */}
      <div className="space-y-2">
        <Label
          className={cn('text-xs', 'font-semibold', 'text-muted-foreground/85')}
        >
          Profile Photo
        </Label>
        <div
          className={cn(
            'flex',
            'flex-col',
            'sm:flex-row',
            'sm:items-center',
            'justify-between',
            'gap-4',
            'p-4',
            'border',
            'border-border/30',
            'rounded-xl',
            'bg-muted-light/40',
          )}
        >
          <div className={cn('flex', 'items-center', 'gap-4')}>
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                'w-14',
                'h-14',
                'rounded-full',
                'bg-primary/10',
                'flex',
                'items-center',
                'justify-center',
                'text-primary',
                'text-xl',
                'font-black',
                'overflow-hidden',
                'shrink-0',
                'cursor-pointer',
                'relative',
                'group',
              )}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className={cn('w-full', 'h-full', 'object-cover')}
                />
              ) : (
                initials
              )}
              <div
                className={cn(
                  'absolute',
                  'inset-0',
                  'bg-black/30',
                  'flex',
                  'items-center',
                  'justify-center',
                  'opacity-0',
                  'group-hover:opacity-100',
                  'transition-opacity',
                  'rounded-full',
                )}
              >
                <Camera size={16} className="text-primary-foreground" />
              </div>
            </div>
            <p
              className={cn(
                'text-[12px]',
                'text-muted-foreground/70',
                'font-medium',
              )}
            >
              JPG, PNG or GIF. Max size of 2MB.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className={cn(
              'h-9',
              'px-4',
              'rounded-xl',
              'border-border',
              'text-[12px]',
              'font-semibold',
              'text-foreground/80',
              'hover:bg-muted-light',
              'shadow-none',
              'cursor-pointer',
              'flex',
              'items-center',
              'gap-1.5',
              'w-full',
              'sm:w-auto',
              'justify-center',
              'shrink-0',
            )}
          >
            <Upload size={13} /> Change Photo
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const r = new FileReader()
              r.onloadend = () => setImgPreview(r.result as string)
              r.readAsDataURL(f)
            }}
          />
        </div>
      </div>

      <Button
        onClick={handleSaveProfile}
        disabled={busy}
        className={cn(
          'h-10',
          'px-8',
          'rounded-xl',
          'bg-primary',
          'hover:bg-primary-hover',
          'text-primary-foreground',
          'text-sm',
          'font-bold',
          'shadow-sm',
          'cursor-pointer',
          'flex',
          'items-center',
          'gap-2',
          'border-none',
          'w-full',
          'sm:w-auto',
          'justify-center',
        )}
      >
        {busy && <Loader variant="white" size={14} />}
        {busy ? 'Saving...' : 'Save Changes'}
      </Button>
    </SettingsSectionShell>
  )
}
