import { useState, useRef, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { apiClient } from '#/lib/api'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useUploadProfileImage, useUpdateUserSettings } from '#/hook'
import { Loader } from '#/components/ui/loader'
import { toast } from 'sonner'
import {
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  Lock,
  Link2,
  Trash2,
  Upload,
  ChevronRight,
  Camera,
  AlertTriangle,
} from 'lucide-react'
import { ChangePasswordDialog } from './ChangePasswordDialog'
import { TwoFactorDialog } from './TwoFactorDialog'
import { SessionsDialog } from './SessionsDialog'
import { DevicesDialog } from './DevicesDialog'

// ─── Sub-nav items ────────────────────────────────────────────────────────────
const subNavItems = [
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'security', label: 'Account & Security', icon: ShieldCheck },
  { id: 'notifs', label: 'Notifications', icon: Bell },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'connected', label: 'Connected Accounts', icon: Link2 },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
]

// ─── Reusable row ─────────────────────────────────────────────────────────────
function Row({
  label,
  desc,
  last = false,
  children,
}: {
  label: string
  desc?: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-4',
        !last && 'border-b border-gray-50',
      )}
    >
      <div className={cn('min-w-0', 'pr-6')}>
        <p className={cn('text-sm', 'font-semibold', 'text-gray-900')}>
          {label}
        </p>
        {desc && (
          <p
            className={cn(
              'text-[12px]',
              'text-gray-400',
              'font-medium',
              'mt-0.5',
            )}
          >
            {desc}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [section, setSection] = useState('profile')

  // profile
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // security dialogs
  const [pwOpen, setPwOpen] = useState(false)
  const [tfaOpen, setTfaOpen] = useState(false)
  const [sessOpen, setSessOpen] = useState(false)
  const [devOpen, setDevOpen] = useState(false)
  const [tfaEnabled, setTfaEnabled] = useState(false)

  // notifications
  const [emailN, setEmailN] = useState(true)
  const [smsN, setSmsN] = useState(false)
  const [mktN, setMktN] = useState(true)
  const [pushN, setPushN] = useState(true)

  // privacy
  const [showProf, setShowProf] = useState(true)
  const [showOnline, setShowOnline] = useState(true)
  const [allowData, setAllowData] = useState(true)

  // delete
  const [delInput, setDelInput] = useState('')
  const [delLoading, setDelLoading] = useState(false)

  const { mutateAsync: uploadImg, isPending: uploading } =
    useUploadProfileImage()
  const { mutateAsync: saveSettings, isPending: saving } =
    useUpdateUserSettings()
  const busy = uploading || saving

  const { data: session, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: async () => (await authClient.getSession()).data,
  })

  useEffect(() => {
    if (!session?.user) return
    const u = session.user as any
    setName(u.name || '')
    setPhone(u.phone || '')
    setLocation(u.location || '')
    setBio(u.bio || '')
    if (u.twoFactorEnabled != null) setTfaEnabled(u.twoFactorEnabled)
    if (u.bookingAlerts != null) setEmailN(u.bookingAlerts)
    if (u.settlementAlerts != null) setSmsN(u.settlementAlerts)
    if (u.marketingAlerts != null) setMktN(u.marketingAlerts)
  }, [session])

  if (!session?.user) return null
  const user = session.user as any
  const avatar = imgPreview || user.image || null
  const initials = (user.name || 'U').charAt(0).toUpperCase()

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      if (name.trim() && name.trim() !== user.name) {
        await authClient.updateUser({ name: name.trim() })
      }
      if (fileRef.current?.files?.[0]) {
        await uploadImg(fileRef.current.files[0])
      }
      await saveSettings({ phone, location, bio })
      await refetch()
      setImgPreview(null)
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile.')
    }
  }

  const handleToggleNotif = async (
    key: 'email' | 'sms' | 'mkt' | 'push',
    val: boolean,
  ) => {
    const prev = { email: emailN, sms: smsN, mkt: mktN, push: pushN }
    if (key === 'email') setEmailN(val)
    if (key === 'sms') setSmsN(val)
    if (key === 'mkt') setMktN(val)
    if (key === 'push') setPushN(val)
    try {
      await saveSettings({
        bookingAlerts: key === 'email' ? val : prev.email,
        settlementAlerts: key === 'sms' ? val : prev.sms,
        marketingAlerts: key === 'mkt' ? val : prev.mkt,
      })
      toast.success('Preference saved!')
    } catch {
      toast.error('Failed to update.')
      if (key === 'email') setEmailN(prev.email)
      if (key === 'sms') setSmsN(prev.sms)
      if (key === 'mkt') setMktN(prev.mkt)
      if (key === 'push') setPushN(prev.push)
    }
  }

  const handleTogglePrivacy = async (
    key: 'prof' | 'online' | 'data',
    val: boolean,
  ) => {
    if (key === 'prof') setShowProf(val)
    if (key === 'online') setShowOnline(val)
    if (key === 'data') setAllowData(val)
    toast.success('Privacy setting updated.')
  }

  const handleDeleteAccount = async () => {
    if (delInput !== 'DELETE') {
      toast.error('Type DELETE to confirm.')
      return
    }
    setDelLoading(true)
    try {
      // Send deletion request to backend — admins process it
      await apiClient.post('/users/settings/delete-request')
      toast.success(
        'Account deletion request submitted. Our team will process it within 48 hours.',
      )
      setDelInput('')
    } catch {
      toast.error(
        'Failed to submit deletion request. Please contact support@vastu.com.',
      )
    } finally {
      setDelLoading(false)
    }
  }

  return (
    <div className="font-sans">
      {/* Page header */}
      <div className={cn('mb-5', 'px-1')}>
        <h1
          className={cn(
            'text-2xl',
            'font-extrabold',
            'text-gray-900',
            'tracking-tight',
            'leading-none',
          )}
        >
          Settings
        </h1>
        <p
          className={cn('text-[13px]', 'text-gray-500', 'mt-2', 'font-medium')}
        >
          Manage your account preferences and security.
        </p>
      </div>

      {/* Card */}
      <div
        className={cn(
          'flex',
          'bg-white',
          'rounded-2xl',
          'border',
          'border-gray-100',
          'shadow-sm',
          'overflow-hidden',
          'min-h-[600px]',
        )}
      >
        {/* ── Left sub-nav ── */}
        <nav
          className={cn(
            'w-[210px]',
            'shrink-0',
            'border-r',
            'border-gray-100',
            'py-3',
            'flex',
            'flex-col',
          )}
        >
          {subNavItems.map(({ id, label, icon: Icon }) => {
            const active = section === id
            const isDel = id === 'delete'
            return (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-[13px] font-semibold text-left w-full border-none cursor-pointer transition-colors border-l-2',
                  active &&
                    !isDel &&
                    'text-[#2d5222] bg-[#F4F8F1]/70 border-[#2d5222]',
                  active && isDel && 'text-red-500 bg-red-50/60 border-red-400',
                  !active &&
                    !isDel &&
                    'text-slate-500 hover:text-gray-800 hover:bg-slate-50 bg-transparent border-transparent',
                  !active &&
                    isDel &&
                    'text-red-400 hover:text-red-500 hover:bg-red-50 bg-transparent border-transparent',
                )}
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* ── Right content ── */}
        <div className={cn('flex-1', 'min-w-0', 'p-8', 'overflow-y-auto')}>
          {/* ── PROFILE INFORMATION ── */}
          {section === 'profile' && (
            <div className={cn('space-y-7', 'max-w-2xl')}>
              <div>
                <h2
                  className={cn('text-base', 'font-extrabold', 'text-gray-900')}
                >
                  Profile Information
                </h2>
                <p
                  className={cn(
                    'text-[12px]',
                    'text-gray-400',
                    'font-medium',
                    'mt-0.5',
                  )}
                >
                  Update your personal details and how others see you.
                </p>
              </div>

              <div
                className={cn(
                  'grid',
                  'grid-cols-1',
                  'sm:grid-cols-2',
                  'gap-x-6',
                  'gap-y-5',
                )}
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="s-name"
                    className={cn('text-xs', 'font-semibold', 'text-gray-500')}
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
                      'border-gray-200',
                      'text-sm',
                      'font-medium',
                      'focus-visible:ring-1',
                      'focus-visible:ring-[#2d5222]/30',
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="s-email"
                    className={cn('text-xs', 'font-semibold', 'text-gray-500')}
                  >
                    Email Address
                  </Label>
                  <Input
                    id="s-email"
                    value={user.email}
                    disabled
                    className={cn(
                      'h-10',
                      'rounded-xl',
                      'border-gray-200',
                      'bg-gray-50',
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
                    className={cn('text-xs', 'font-semibold', 'text-gray-500')}
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
                      'border-gray-200',
                      'text-sm',
                      'font-medium',
                      'focus-visible:ring-1',
                      'focus-visible:ring-[#2d5222]/30',
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="s-loc"
                    className={cn('text-xs', 'font-semibold', 'text-gray-500')}
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
                      'border-gray-200',
                      'text-sm',
                      'font-medium',
                      'focus-visible:ring-1',
                      'focus-visible:ring-[#2d5222]/30',
                    )}
                  />
                </div>
                <div className={cn('space-y-1.5', 'sm:col-span-2')}>
                  <Label
                    htmlFor="s-bio"
                    className={cn('text-xs', 'font-semibold', 'text-gray-500')}
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
                        'border-gray-200',
                        'text-sm',
                        'font-medium',
                        'resize-none',
                        'focus-visible:ring-1',
                        'focus-visible:ring-[#2d5222]/30',
                        'pb-7',
                      )}
                    />
                    <span
                      className={cn(
                        'absolute',
                        'bottom-2.5',
                        'right-3',
                        'text-[10px]',
                        'text-gray-400',
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
                  className={cn('text-xs', 'font-semibold', 'text-gray-500')}
                >
                  Profile Photo
                </Label>
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-between',
                    'gap-4',
                    'p-4',
                    'border',
                    'border-gray-100',
                    'rounded-xl',
                    'bg-gray-50/40',
                  )}
                >
                  <div className={cn('flex', 'items-center', 'gap-4')}>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={cn(
                        'w-14',
                        'h-14',
                        'rounded-full',
                        'bg-[#2d5222]/10',
                        'flex',
                        'items-center',
                        'justify-center',
                        'text-[#2d5222]',
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
                        <Camera size={16} className="text-white" />
                      </div>
                    </div>
                    <p
                      className={cn(
                        'text-[12px]',
                        'text-gray-400',
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
                      'border-gray-200',
                      'text-[12px]',
                      'font-semibold',
                      'text-gray-700',
                      'hover:bg-gray-50',
                      'shadow-none',
                      'cursor-pointer',
                      'flex',
                      'items-center',
                      'gap-1.5',
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
                  'bg-[#2d5222]',
                  'hover:bg-[#1e3a17]',
                  'text-white',
                  'text-sm',
                  'font-bold',
                  'shadow-sm',
                  'cursor-pointer',
                  'flex',
                  'items-center',
                  'gap-2',
                  'border-none',
                )}
              >
                {busy && <Loader variant="white" size={14} />}
                {busy ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* ── ACCOUNT & SECURITY ── */}
          {section === 'security' && (
            <div className={cn('space-y-7', 'max-w-2xl')}>
              <div>
                <h2
                  className={cn('text-base', 'font-extrabold', 'text-gray-900')}
                >
                  Account &amp; Security
                </h2>
                <p
                  className={cn(
                    'text-[12px]',
                    'text-gray-400',
                    'font-medium',
                    'mt-0.5',
                  )}
                >
                  Manage your password and keep your account secure.
                </p>
              </div>
              <div className={cn('divide-y', 'divide-gray-50')}>
                <Row label="Password" desc="••••••••••••••••">
                  <button
                    onClick={() => setPwOpen(true)}
                    className={cn(
                      'flex',
                      'items-center',
                      'gap-1',
                      'text-[12px]',
                      'font-semibold',
                      'text-gray-500',
                      'hover:text-gray-800',
                      'cursor-pointer',
                      'bg-transparent',
                      'border-none',
                      'transition-colors',
                    )}
                  >
                    Change Password <ChevronRight size={14} />
                  </button>
                </Row>
                <Row
                  label="Two-Factor Authentication"
                  desc="Add an extra layer of security to your account."
                >
                  <Switch
                    checked={tfaEnabled}
                    onCheckedChange={(val) => {
                      if (val) {
                        setTfaOpen(true)
                      } else {
                        setTfaEnabled(false)
                        saveSettings({ twoFactorEnabled: false })
                          .then(() => toast.success('2FA disabled.'))
                          .catch(() => toast.error('Failed.'))
                      }
                    }}
                  />
                </Row>
                <Row
                  label="Login Sessions"
                  desc="View and manage your active sessions."
                >
                  <button
                    onClick={() => setSessOpen(true)}
                    className={cn(
                      'flex',
                      'items-center',
                      'gap-1',
                      'text-[12px]',
                      'font-semibold',
                      'text-gray-500',
                      'hover:text-gray-800',
                      'cursor-pointer',
                      'bg-transparent',
                      'border-none',
                      'transition-colors',
                    )}
                  >
                    View Sessions <ChevronRight size={14} />
                  </button>
                </Row>
                <Row
                  label="Trusted Devices"
                  desc="Manage devices that can access your account."
                  last
                >
                  <button
                    onClick={() => setDevOpen(true)}
                    className={cn(
                      'flex',
                      'items-center',
                      'gap-1',
                      'text-[12px]',
                      'font-semibold',
                      'text-gray-500',
                      'hover:text-gray-800',
                      'cursor-pointer',
                      'bg-transparent',
                      'border-none',
                      'transition-colors',
                    )}
                  >
                    View Devices <ChevronRight size={14} />
                  </button>
                </Row>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifs' && (
            <div className={cn('space-y-7', 'max-w-2xl')}>
              <div>
                <h2
                  className={cn('text-base', 'font-extrabold', 'text-gray-900')}
                >
                  Notifications
                </h2>
                <p
                  className={cn(
                    'text-[12px]',
                    'text-gray-400',
                    'font-medium',
                    'mt-0.5',
                  )}
                >
                  Choose how and when you want to be notified.
                </p>
              </div>
              <div className={cn('divide-y', 'divide-gray-50')}>
                <Row
                  label="Email Notifications"
                  desc="Booking updates, approvals and receipts."
                >
                  <Switch
                    checked={emailN}
                    onCheckedChange={(v) => handleToggleNotif('email', v)}
                  />
                </Row>
                <Row
                  label="SMS Notifications"
                  desc="Text messages for bookings and payments."
                >
                  <Switch
                    checked={smsN}
                    onCheckedChange={(v) => handleToggleNotif('sms', v)}
                  />
                </Row>
                <Row
                  label="Marketing Emails"
                  desc="Offers, promotions and new features."
                >
                  <Switch
                    checked={mktN}
                    onCheckedChange={(v) => handleToggleNotif('mkt', v)}
                  />
                </Row>
                <Row
                  label="Push Notifications"
                  desc="Real-time alerts on your device."
                  last
                >
                  <Switch
                    checked={pushN}
                    onCheckedChange={(v) => handleToggleNotif('push', v)}
                  />
                </Row>
              </div>
            </div>
          )}

          {/* ── PAYMENT METHODS ── */}
          {section === 'payment' && (
            <div className={cn('space-y-7', 'max-w-2xl')}>
              <div>
                <h2
                  className={cn('text-base', 'font-extrabold', 'text-gray-900')}
                >
                  Payment Methods
                </h2>
                <p
                  className={cn(
                    'text-[12px]',
                    'text-gray-400',
                    'font-medium',
                    'mt-0.5',
                  )}
                >
                  Manage your saved payment methods and billing details.
                </p>
              </div>
              <div
                className={cn(
                  'flex',
                  'flex-col',
                  'items-center',
                  'justify-center',
                  'py-16',
                  'gap-3',
                  'border',
                  'border-dashed',
                  'border-gray-200',
                  'rounded-xl',
                )}
              >
                <div
                  className={cn(
                    'w-12',
                    'h-12',
                    'rounded-xl',
                    'bg-slate-50',
                    'flex',
                    'items-center',
                    'justify-center',
                  )}
                >
                  <CreditCard size={20} className="text-slate-300" />
                </div>
                <p
                  className={cn(
                    'text-[12px]',
                    'font-semibold',
                    'text-gray-400',
                  )}
                >
                  No payment methods added yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Payment methods coming soon.')}
                  className={cn(
                    'h-9',
                    'px-5',
                    'rounded-xl',
                    'border-gray-200',
                    'text-[12px]',
                    'font-semibold',
                    'shadow-none',
                    'cursor-pointer',
                  )}
                >
                  Add Payment Method
                </Button>
              </div>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {section === 'privacy' && (
            <div className={cn('space-y-7', 'max-w-2xl')}>
              <div>
                <h2
                  className={cn('text-base', 'font-extrabold', 'text-gray-900')}
                >
                  Privacy
                </h2>
                <p
                  className={cn(
                    'text-[12px]',
                    'text-gray-400',
                    'font-medium',
                    'mt-0.5',
                  )}
                >
                  Control your data and privacy settings.
                </p>
              </div>
              <div className={cn('divide-y', 'divide-gray-50')}>
                <Row
                  label="Show profile to other users"
                  desc="Let renters and hosts see your public profile."
                >
                  <Switch
                    checked={showProf}
                    onCheckedChange={(v) => handleTogglePrivacy('prof', v)}
                  />
                </Row>
                <Row
                  label="Show online status"
                  desc="Let others see when you are active."
                >
                  <Switch
                    checked={showOnline}
                    onCheckedChange={(v) => handleTogglePrivacy('online', v)}
                  />
                </Row>
                <Row
                  label="Allow data for personalisation"
                  desc="Help us improve your recommendations."
                  last
                >
                  <Switch
                    checked={allowData}
                    onCheckedChange={(v) => handleTogglePrivacy('data', v)}
                  />
                </Row>
              </div>
            </div>
          )}

          {/* ── CONNECTED ACCOUNTS ── */}
          {section === 'connected' && (
            <div className={cn('space-y-7', 'max-w-2xl')}>
              <div>
                <h2
                  className={cn('text-base', 'font-extrabold', 'text-gray-900')}
                >
                  Connected Accounts
                </h2>
                <p
                  className={cn(
                    'text-[12px]',
                    'text-gray-400',
                    'font-medium',
                    'mt-0.5',
                  )}
                >
                  Link your social accounts for faster sign-in.
                </p>
              </div>
              <div className={cn('divide-y', 'divide-gray-50')}>
                {[
                  {
                    name: 'Google',
                    icon: '🔵',
                    hint: 'Sign in with your Google account',
                  },
                  {
                    name: 'Facebook',
                    icon: '🔷',
                    hint: 'Sign in with your Facebook account',
                  },
                  {
                    name: 'Apple',
                    icon: '⚫',
                    hint: 'Sign in with your Apple ID',
                  },
                ].map(({ name: accountName, icon, hint }, i, arr) => {
                  const linked = accountName === 'Google'
                  return (
                    <Row
                      key={accountName}
                      label={`${icon} ${accountName}`}
                      desc={linked ? 'Connected' : hint}
                      last={i === arr.length - 1}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.info(
                            `${linked ? 'Disconnect' : 'Connect'} ${accountName} coming soon.`,
                          )
                        }
                        className={cn(
                          'h-8 px-4 rounded-xl text-[12px] font-semibold shadow-none cursor-pointer',
                          linked
                            ? 'border-red-200 text-red-500 hover:bg-red-50'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        {linked ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Row>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── DELETE ACCOUNT ── */}
          {section === 'delete' && (
            <div className={cn('space-y-7', 'max-w-2xl')}>
              <div>
                <h2
                  className={cn('text-base', 'font-extrabold', 'text-gray-900')}
                >
                  Delete Account
                </h2>
                <p
                  className={cn(
                    'text-[12px]',
                    'text-gray-400',
                    'font-medium',
                    'mt-0.5',
                  )}
                >
                  Permanently remove your account and all associated data.
                </p>
              </div>

              {/* Warning card */}
              <div
                className={cn(
                  'bg-red-50/60',
                  'border',
                  'border-red-100',
                  'rounded-xl',
                  'p-5',
                  'flex',
                  'items-start',
                  'gap-3',
                )}
              >
                <div
                  className={cn(
                    'w-9',
                    'h-9',
                    'rounded-xl',
                    'bg-red-100',
                    'flex',
                    'items-center',
                    'justify-center',
                    'shrink-0',
                    'mt-0.5',
                  )}
                >
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                <div>
                  <p className={cn('text-sm', 'font-bold', 'text-red-700')}>
                    This action is irreversible
                  </p>
                  <p
                    className={cn(
                      'text-[12px]',
                      'text-red-500',
                      'font-medium',
                      'mt-1',
                      'leading-relaxed',
                    )}
                  >
                    Deleting your account will permanently remove all your
                    listings, bookings, reviews, messages, and personal data.
                    This cannot be undone.
                  </p>
                </div>
              </div>

              {/* What will be deleted */}
              <div
                className={cn(
                  'bg-white',
                  'border',
                  'border-gray-100',
                  'rounded-xl',
                  'p-5',
                  'space-y-2',
                )}
              >
                <p
                  className={cn(
                    'text-xs',
                    'font-bold',
                    'text-gray-700',
                    'mb-3',
                  )}
                >
                  The following will be permanently deleted:
                </p>
                {[
                  'Your profile and personal information',
                  'All your listings and rental history',
                  'All bookings and payment records',
                  'Your reviews and ratings',
                  'All messages and conversations',
                ].map((item) => (
                  <div
                    key={item}
                    className={cn(
                      'flex',
                      'items-center',
                      'gap-2',
                      'text-[12px]',
                      'text-gray-500',
                      'font-medium',
                    )}
                  >
                    <div
                      className={cn(
                        'w-1.5',
                        'h-1.5',
                        'rounded-full',
                        'bg-red-400',
                        'shrink-0',
                      )}
                    />
                    {item}
                  </div>
                ))}
              </div>

              {/* Confirmation input */}
              <div className="space-y-2">
                <Label
                  className={cn('text-xs', 'font-semibold', 'text-gray-600')}
                >
                  Type{' '}
                  <span
                    className={cn(
                      'font-black',
                      'text-red-600',
                      'tracking-widest',
                    )}
                  >
                    DELETE
                  </span>{' '}
                  to confirm
                </Label>
                <Input
                  value={delInput}
                  onChange={(e) => setDelInput(e.target.value)}
                  placeholder="Type DELETE here"
                  className={cn(
                    'h-10',
                    'rounded-xl',
                    'border-gray-200',
                    'text-sm',
                    'font-medium',
                    'focus-visible:ring-1',
                    'focus-visible:ring-red-300',
                    'max-w-xs',
                  )}
                />
              </div>

              <Button
                onClick={handleDeleteAccount}
                disabled={delInput !== 'DELETE' || delLoading}
                className={cn(
                  'h-10',
                  'px-6',
                  'rounded-xl',
                  'bg-red-600',
                  'hover:bg-red-700',
                  'text-white',
                  'text-sm',
                  'font-bold',
                  'cursor-pointer',
                  'border-none',
                  'shadow-sm',
                  'flex',
                  'items-center',
                  'gap-2',
                  'disabled:opacity-40',
                  'disabled:cursor-not-allowed',
                )}
              >
                {delLoading && <Loader variant="white" size={14} />}
                {delLoading ? 'Deleting...' : 'Delete My Account'}
              </Button>
            </div>
          )}
        </div>
        {/* end right content */}
      </div>
      {/* end card */}

      {/* ── Dialogs ── */}
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      <TwoFactorDialog
        open={tfaOpen}
        onOpenChange={setTfaOpen}
        twoFactorEnabled={tfaEnabled}
        setTwoFactorEnabled={(val) => {
          setTfaEnabled(val)
          saveSettings({ twoFactorEnabled: val }).catch(() => {})
        }}
        userEmail={user.email}
      />
      <SessionsDialog open={sessOpen} onOpenChange={setSessOpen} />
      <DevicesDialog open={devOpen} onOpenChange={setDevOpen} />
    </div>
  )
}
