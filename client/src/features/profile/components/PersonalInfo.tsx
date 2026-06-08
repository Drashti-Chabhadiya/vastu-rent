import { useState, useRef, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Mail,
  Calendar,
  Camera,
  Phone,
  Pencil,
  ChevronRight,
  Leaf,
  CreditCard,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  useUploadProfileImage,
  useUpdateUserSettings,
  useMyListings,
} from '#/hook'
import { Loader, LoadingOverlay } from '#/components/ui/loader'
import { Link } from '@tanstack/react-router'
import { apiClient } from '#/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Switch } from '#/components/ui/switch'
import { toast } from 'sonner'
import { ChangePasswordDialog } from './ChangePasswordDialog'
import { TwoFactorDialog } from './TwoFactorDialog'
import { SessionsDialog } from './SessionsDialog'
import { DevicesDialog } from './DevicesDialog'
import { ImageEditorModal } from './ImageEditorModal'

export function PersonalInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Custom details states matching exact database values
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('')
  const [dob, setDob] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)

  // Dialog visibility states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [is2faModalOpen, setIs2faModalOpen] = useState(false)
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false)
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadProfileImage()

  const { mutateAsync: updateSettings, isPending: isSavingSettings } =
    useUpdateUserSettings()

  const [isVerifying, setIsVerifying] = useState(false)
  const { data: myListings } = useMyListings()
  const isSaving = isUploadingImage || isSavingSettings || isVerifying

  // Fetch session via React Query for consistency
  const { data: session, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  // Verify Stripe Checkout session on mount/redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (sessionId) {
      const verifySession = async () => {
        setIsVerifying(true)
        const toastId = toast.loading(
          'Verifying your payment and updating your plan...',
        )
        try {
          const res = await apiClient.post('/billing/verify-session', {
            sessionId,
          })
          if (res.data?.success) {
            toast.success('🎉 Plan upgraded successfully!', { id: toastId })
            await refetch()
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            )
          } else {
            toast.error('Could not verify your checkout session.', {
              id: toastId,
            })
          }
        } catch (error: any) {
          console.error('Session verification failed:', error)
          toast.error(
            error.response?.data?.message || 'Payment verification failed.',
            { id: toastId },
          )
        } finally {
          setIsVerifying(false)
        }
      }
      verifySession()
    }
  }, [refetch])

  // Synchronize state once session data loads from backend DB
  useEffect(() => {
    if (session?.user) {
      const u = session.user as any
      setName(u.name || '')
      setGender(u.gender || '')
      setLocation(u.location || '')
      setPhone(u.phone || '')
      setLanguage(u.language || '')
      setDob(u.dob || '')
      setCurrency(u.currency || 'INR')
      if (u.bookingAlerts !== undefined && u.bookingAlerts !== null)
        setEmailNotifications(u.bookingAlerts)
      if (u.settlementAlerts !== undefined && u.settlementAlerts !== null)
        setSmsNotifications(u.settlementAlerts)
      if (u.marketingAlerts !== undefined && u.marketingAlerts !== null)
        setMarketingEmails(u.marketingAlerts)
      if (u.twoFactorEnabled !== undefined && u.twoFactorEnabled !== null)
        setTwoFactorEnabled(u.twoFactorEnabled)
    }
  }, [session])

  // Instant Auto-Save preferences handler
  const handleTogglePreference = async (
    key: 'email' | 'sms' | 'marketing',
    newValue: boolean,
  ) => {
    if (key === 'email') setEmailNotifications(newValue)
    if (key === 'sms') setSmsNotifications(newValue)
    if (key === 'marketing') setMarketingEmails(newValue)

    try {
      await updateSettings({
        bookingAlerts: key === 'email' ? newValue : emailNotifications,
        settlementAlerts: key === 'sms' ? newValue : smsNotifications,
        marketingAlerts: key === 'marketing' ? newValue : marketingEmails,
      })
      toast.success('Preferences auto-saved successfully!')
    } catch (error) {
      console.error('Failed to update preference:', error)
      toast.error('Failed to update preference.')
      if (key === 'email') setEmailNotifications(!newValue)
      if (key === 'sms') setSmsNotifications(!newValue)
      if (key === 'marketing') setMarketingEmails(!newValue)
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency)
    try {
      await updateSettings({
        currency: newCurrency,
      })
      toast.success(`Currency set to ${newCurrency}`)
    } catch (error) {
      console.error('Failed to update currency:', error)
      toast.error('Failed to update currency.')
    }
  }

  // Database persistent 2FA status toggler
  const handleToggleTwoFactor = async (enabled: boolean) => {
    try {
      await updateSettings({
        twoFactorEnabled: enabled,
      })
      setTwoFactorEnabled(enabled)
    } catch (error) {
      console.error('Failed to update 2FA status:', error)
      toast.error('Failed to update 2FA settings.')
    }
  }

  const handleEditClick = () => {
    if (isEditing) {
      setName(session?.user.name || '')
      setImagePreview(null)
      setCroppedFile(null)
      setEditorImageSrc(null)
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
        setEditorImageSrc(reader.result as string)
        setIsEditorOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedBlob: Blob, croppedDataUrl: string) => {
    setImagePreview(croppedDataUrl)
    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
    setCroppedFile(file)
  }

  const handleSaveChanges = async () => {
    try {
      // 1. Update name via better-auth if edited
      if (name.trim() && name.trim() !== session?.user.name) {
        await authClient.updateUser({
          name: name.trim(),
        })
      }

      // 2. Upload cropped image if chosen
      if (croppedFile) {
        await uploadImage(croppedFile)
      }

      // 3. Save other properties and alerts to the database
      await updateSettings({
        gender,
        location,
        phone,
        language,
        dob,
        currency,
        bookingAlerts: emailNotifications,
        settlementAlerts: smsNotifications,
        marketingAlerts: marketingEmails,
      })

      await refetch()
      setIsEditing(false)
      setImagePreview(null)
      setCroppedFile(null)
      setEditorImageSrc(null)
      toast.success('Profile changes saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save changes. Please try again.')
    }
  }

  if (!session) return null

  const joinDate = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
    : 'Jan 2024'

  const usedCount = myListings?.length || 0
  const rawTier = (session?.user as any)?.subscriptionTier || 'Starter'
  const expiresAtStr = (session?.user as any)?.subscriptionExpiresAt
  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null
  const isExpired = expiresAt ? expiresAt < new Date() : false
  const activeTier = isExpired ? 'Starter' : rawTier

  let limit = 5
  let limitStr = '5'
  if (activeTier.toLowerCase() === 'pro') {
    limit = 50
    limitStr = '50'
  } else if (activeTier.toLowerCase() === 'business') {
    limit = 999999
    limitStr = 'Unlimited'
  }

  const quotaPercent = Math.min(100, (usedCount / limit) * 100)

  let barColor = 'bg-primary'
  if (quotaPercent >= 90) {
    barColor = 'bg-destructive'
  } else if (quotaPercent >= 70) {
    barColor = 'bg-amber-500'
  }

  const fields = [
    { key: 'name', label: 'Full Name', value: name },
    { key: 'email', label: 'Email Address', value: session?.user?.email },
    {
      key: 'image',
      label: 'Profile Photo',
      value: session?.user?.image || imagePreview,
    },
    { key: 'phone', label: 'Phone Number', value: phone },
    { key: 'gender', label: 'Gender', value: gender },
    { key: 'location', label: 'Location', value: location },
    { key: 'language', label: 'Preferred Language', value: language },
    { key: 'dob', label: 'Date of Birth', value: dob },
  ]

  const filledFields = fields.filter((f) => f.value && f.value.trim() !== '')
  const missingFields = fields.filter((f) => !f.value || f.value.trim() === '')
  const completenessPercent = Math.round(
    (filledFields.length / fields.length) * 100,
  )

  return (
    <div className="font-sans">
      {/* Page Title Header */}
      <div className="mb-6 p-1">
        <h1 className="text-2xl font-extrabold text-foreground font-display tracking-tight leading-none">
          My Profile
        </h1>
        <p className="text-[13px] text-muted-foreground/85 mt-2 font-medium">
          Manage your personal information and account preferences.
        </p>
      </div>

      <div className="space-y-8 relative">
        {isSaving && (
          <LoadingOverlay
            message="Saving profile changes..."
            className="rounded-[32px] z-50 animate-fade-in"
          />
        )}

        {/* ─── Profile & Personal Info Row Card ─── */}
        <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left User Summary Column */}
            <div className="lg:border-r lg:border-border/30 lg:pr-8 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-primary/5 border border-border/30 shadow-sm flex items-center justify-center text-4xl font-extrabold text-primary overflow-hidden relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover animate-fade-in"
                    />
                  ) : session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    session.user.name.charAt(0).toUpperCase() || 'U'
                  )}
                  {isEditing && (
                    <div
                      onClick={handleImageClick}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={24} className="mb-1 animate-scale-in" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-center">
                        Edit
                      </span>
                    </div>
                  )}
                </div>
                {/* Pencil Edit Overlay Button on Bottom-Right */}
                <div
                  onClick={handleImageClick}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center cursor-pointer text-primary hover:scale-105 active:scale-95 transition-all"
                >
                  <Pencil size={12} className="text-primary" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <h4 className="font-extrabold text-foreground text-xl mt-4 font-display">
                {session.user.name}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary text-[10px] font-bold px-3 py-1 mt-2">
                <svg
                  className="h-3 w-3 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Verified Member
              </span>

              {/* Profile Completeness Widget */}
              <div className="w-full mt-6 bg-muted-light/30 border border-border/20 rounded-2xl p-4 text-left">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                    Completeness
                  </span>
                  <span
                    className={cn(
                      'text-xs font-black',
                      completenessPercent === 100
                        ? 'text-primary'
                        : 'text-amber-500',
                    )}
                  >
                    {completenessPercent}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-muted-light rounded-full overflow-hidden mb-3">
                  <div
                    className={cn(
                      'h-full transition-all duration-500 rounded-full',
                      completenessPercent === 100
                        ? 'bg-primary'
                        : 'bg-amber-500',
                    )}
                    style={{ width: `${completenessPercent}%` }}
                  />
                </div>

                {/* Missing fields list */}
                {missingFields.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-muted-dark uppercase tracking-wider">
                      Pending Details:
                    </p>
                    <ul className="space-y-1 pl-1">
                      {missingFields.map((f) => (
                        <li
                          key={f.key}
                          className="text-[10px] font-semibold text-amber-600 flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary">
                    <Sparkles
                      size={11}
                      className="fill-primary-soft shrink-0 animate-bounce"
                    />
                    Profile fully complete!
                  </div>
                )}
              </div>

              {/* Dynamic Contact Details */}
              <div className="mt-6 space-y-4 text-left w-full max-w-[240px]">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                  <Mail
                    size={16}
                    className="text-muted-foreground/70 shrink-0"
                  />
                  <span className="truncate">{session.user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                  <Phone
                    size={16}
                    className="text-muted-foreground/70 shrink-0"
                  />
                  <span
                    className={cn(!phone && 'italic text-muted-foreground/50')}
                  >
                    {phone || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                  <Calendar
                    size={16}
                    className="text-muted-foreground/70 shrink-0"
                  />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Right Personal Information Form Column */}
            <div className="lg:col-span-2 lg:pl-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-foreground text-base font-display">
                  Personal Information
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditClick}
                  className={cn(
                    'h-9 rounded-xl text-xs font-bold transition-all border shrink-0 shadow-none cursor-pointer',
                    isEditing
                      ? 'border-danger/50 text-destructive bg-danger hover:bg-danger/70 hover:text-destructive'
                      : 'border-primary text-primary hover:bg-primary/5',
                  )}
                >
                  {isEditing ? (
                    'Cancel'
                  ) : (
                    <>
                      <Pencil size={12} className="mr-1 text-primary" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fullName"
                    className="text-xs font-bold text-muted-foreground/70"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={name}
                    placeholder="Not specified"
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                      isEditing
                        ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                        : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                    )}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="gender"
                    className="text-xs font-bold text-muted-foreground/70"
                  >
                    Gender
                  </Label>
                  <Select
                    value={gender}
                    onValueChange={setGender}
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      id="gender"
                      className={cn(
                        'w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-muted-foreground/70',
                        isEditing
                          ? 'bg-card border-primary ring-2 ring-primary/5'
                          : 'bg-muted-light/50 [&>span]:opacity-100',
                      )}
                    >
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold text-muted-foreground/70"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={session.user.email}
                    disabled
                    className="h-11 rounded-xl border-border bg-muted-light/50 text-foreground font-semibold text-sm disabled:opacity-100 disabled:cursor-default"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="location"
                    className="text-xs font-bold text-muted-foreground/70"
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    placeholder="Not specified"
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                      isEditing
                        ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                        : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                    )}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-bold text-muted-foreground/70"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    placeholder="Not specified"
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                      isEditing
                        ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                        : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                    )}
                  />
                </div>

                {/* Preferred Language */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="language"
                    className="text-xs font-bold text-muted-foreground/70"
                  >
                    Preferred Language
                  </Label>
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      id="language"
                      className={cn(
                        'w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-muted-foreground/70',
                        isEditing
                          ? 'bg-card border-primary ring-2 ring-primary/5'
                          : 'bg-muted-light/50 [&>span]:opacity-100',
                      )}
                    >
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dob"
                    className="text-xs font-bold text-muted-foreground/70"
                  >
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Input
                      id="dob"
                      value={dob}
                      placeholder="Not specified"
                      onChange={(e) => setDob(e.target.value)}
                      disabled={!isEditing}
                      className={cn(
                        'h-11 pr-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                        isEditing
                          ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                          : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                      )}
                    />
                    <Calendar
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Save Button */}
              {isEditing && (
                <div className="mt-8 pt-6 border-t border-border/30 flex gap-4">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground h-11 px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    {isSaving && <Loader variant="white" size={16} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Cards Row: Account Security & Preferences ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Account Security */}
          <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8">
            <h3 className="font-extrabold text-foreground text-base font-display">
              Account Security
            </h3>
            <p className="text-xs text-muted-foreground/85 mt-1 font-medium leading-none">
              Manage your password and account security settings.
            </p>

            <div className="mt-6 space-y-4">
              {/* Password */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    Password
                  </span>
                  <span className="text-xs text-muted-foreground/70 font-semibold mt-0.5 tracking-wider">
                    ••••••••••••
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
                >
                  Change
                </Button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    Two-Factor Authentication
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1.5 leading-none border transition-colors',
                      twoFactorEnabled
                        ? 'text-primary bg-primary-soft border-primary-border'
                        : 'text-muted-foreground/85 bg-muted/50 border-border',
                    )}
                  >
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIs2faModalOpen(true)
                  }}
                  className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
                >
                  Manage
                </Button>
              </div>

              {/* Login Sessions */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    Login Sessions
                  </span>
                  <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                    Manage your active sessions
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSessionsModalOpen(true)}
                  className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
                >
                  View
                </Button>
              </div>

              {/* Devices */}
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    Devices
                  </span>
                  <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                    Manage your trusted devices
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDevicesModalOpen(true)}
                  className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
                >
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2: Preferences */}
          <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8">
            <h3 className="font-extrabold text-foreground text-base font-display">
              Preferences
            </h3>
            <p className="text-xs text-muted-foreground/85 mt-1 font-medium leading-none">
              Customize your experience on Vastu.
            </p>

            <div className="mt-6 space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    Email Notifications
                  </span>
                  <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                    Stay updated with important updates
                  </span>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) =>
                    handleTogglePreference('email', checked)
                  }
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    SMS Notifications
                  </span>
                  <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                    Receive text messages for bookings
                  </span>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={(checked) =>
                    handleTogglePreference('sms', checked)
                  }
                />
              </div>

              {/* Marketing Emails */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    Marketing Emails
                  </span>
                  <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                    Receive offers and promotions
                  </span>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={(checked) =>
                    handleTogglePreference('marketing', checked)
                  }
                />
              </div>

              {/* Currency */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-foreground">
                  Currency
                </span>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-28 h-9 px-3 rounded-xl border border-border text-xs font-semibold text-foreground bg-card focus:outline-none cursor-pointer shadow-none">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Subscription Plan Card ─── */}
        <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8 flex flex-col md:flex-row items-stretch justify-between gap-8 relative overflow-hidden">
          {/* Decorative background gradient */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

          {/* Left: Plan Status */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base font-display">
                    Subscription Plan
                  </h3>
                  <p className="text-xs text-muted-foreground/85 mt-0.5 font-medium leading-none">
                    Manage your current plan, check limits, and view options.
                  </p>
                </div>
              </div>

              {/* Plan Tier Info */}
              <div className="mt-8 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black text-foreground font-display tracking-tight font-sans">
                  {activeTier} Plan
                </span>
                {isExpired && (
                  <span className="text-[10px] font-bold text-destructive bg-danger border border-destructive/20 rounded-full px-2.5 py-0.5">
                    Plan Expired
                  </span>
                )}
              </div>

              {/* Validity Details */}
              <p className="text-xs text-muted-foreground/85 font-semibold mt-2.5">
                {activeTier.toLowerCase() === 'starter' ? (
                  'Enjoy basic hosting with lifetime free access.'
                ) : (
                  <>
                    Valid until{' '}
                    <span className="text-foreground font-bold">
                      {expiresAt
                        ? expiresAt.toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                        : 'N/A'}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Quick Upgrade Callout */}
            <div className="mt-8">
              <Link to="/pricing">
                <Button className="rounded-xl h-10 px-5 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer">
                  <Sparkles size={13} />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Middle border separator for larger screens */}
          <div className="hidden md:block w-px bg-border/40 shrink-0 self-stretch" />

          {/* Right: Quota Utilization */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  Listing Capacity
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {usedCount} / {limitStr} Used
                </span>
              </div>

              {/* Quota Progress Bar */}
              <div className="w-full h-3 bg-muted-light/60 rounded-full overflow-hidden mt-3.5 border border-border/10">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500 ease-out',
                    barColor,
                  )}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>

              {/* Limit Status Description */}
              <p className="text-[11px] text-muted-foreground/85 mt-3.5 font-medium leading-relaxed">
                {activeTier.toLowerCase() === 'starter'
                  ? 'Starter members can list up to 5 items. Upgrade to a paid plan to list up to 50 or unlimited items.'
                  : activeTier.toLowerCase() === 'pro'
                    ? 'Pro members can list up to 50 items. Upgrade to the Business plan for unlimited items.'
                    : 'You have unlimited listing capacity with your Business plan!'}
              </p>
            </div>

            {/* Warning if nearing limits */}
            {activeTier.toLowerCase() !== 'business' && usedCount >= limit && (
              <div className="bg-danger border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 mt-6">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-normal">
                  You have reached your listing limit. Upgrade your subscription
                  plan to create new listings.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom Row: Green Member Banner ─── */}
        <div className="bg-primary-soft rounded-[32px] border border-primary-border p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-border text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-primary font-display">
                Green Member
              </span>
              <span className="text-xs text-muted-foreground/85 font-bold leading-none mt-1">
                You're saving the planet!
              </span>
              <span className="text-[11px] text-muted-foreground/70 font-semibold mt-1">
                Thank you for being a part of our sustainable community.
              </span>
            </div>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline shrink-0 cursor-pointer"
          >
            <span>View Impact</span>
            <ChevronRight size={14} className="mt-0.5" />
          </Link>
        </div>
      </div>

      {/* Account Security Modals */}
      <ChangePasswordDialog
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
      <TwoFactorDialog
        open={is2faModalOpen}
        onOpenChange={setIs2faModalOpen}
        twoFactorEnabled={twoFactorEnabled}
        setTwoFactorEnabled={handleToggleTwoFactor}
        userEmail={session.user.email}
      />
      <SessionsDialog
        open={isSessionsModalOpen}
        onOpenChange={setIsSessionsModalOpen}
      />
      <DevicesDialog
        open={isDevicesModalOpen}
        onOpenChange={setIsDevicesModalOpen}
      />
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }}
        imageSrc={editorImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
