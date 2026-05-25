import { useState, useRef, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Mail,
  User as UserIcon,
  Calendar,
  Camera,
  Phone,
  Pencil,
  ChevronRight,
  Leaf,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useUploadProfileImage, useUpdateUserSettings } from '#/hook'
import { Loader, LoadingOverlay } from '#/components/ui/loader'
import { Link } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Switch } from '#/components/ui/switch'

export function PersonalInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Custom details states matching exact screenshot data
  const [gender, setGender] = useState('Female')
  const [location, setLocation] = useState('Gurugram, Haryana, India')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [language, setLanguage] = useState('English')
  const [dob, setDob] = useState('12 March 1995')
  const [currency, setCurrency] = useState('INR')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)

  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadProfileImage()
  
  const { mutateAsync: updateSettings, isPending: isSavingSettings } =
    useUpdateUserSettings()

  const isSaving = isUploadingImage || isSavingSettings

  // Fetch session via React Query for consistency
  const { data: session, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  // Synchronize state once session data loads and load localStorage custom properties
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      
      const key = `profile_${session.user.id || session.user.email}`
      const saved = localStorage.getItem(key)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.gender) setGender(parsed.gender)
          if (parsed.location) setLocation(parsed.location)
          if (parsed.phone) setPhone(parsed.phone)
          if (parsed.language) setLanguage(parsed.language)
          if (parsed.dob) setDob(parsed.dob)
          if (parsed.currency) setCurrency(parsed.currency)
          if (parsed.emailNotifications !== undefined) setEmailNotifications(parsed.emailNotifications)
          if (parsed.smsNotifications !== undefined) setSmsNotifications(parsed.smsNotifications)
          if (parsed.marketingEmails !== undefined) setMarketingEmails(parsed.marketingEmails)
        } catch (e) {
          console.error('Error loading profile storage:', e)
        }
      }
    }
  }, [session])

  const handleEditClick = () => {
    if (isEditing) {
      setName(session?.user.name || '')
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
      if (name.trim() && name.trim() !== session?.user.name) {
        await authClient.updateUser({
          name: name.trim(),
        })
      }

      // 2. Upload image if chosen
      if (fileInputRef.current?.files?.[0]) {
        await uploadImage(fileInputRef.current.files[0])
      }

      // 3. Save other properties locally
      if (session?.user) {
        const key = `profile_${session.user.id || session.user.email}`
        const dataToSave = {
          gender,
          location,
          phone,
          language,
          dob,
          currency,
          emailNotifications,
          smsNotifications,
          marketingEmails,
        }
        localStorage.setItem(key, JSON.stringify(dataToSave))
      }

      // 4. Update database settings for alerts
      await updateSettings({
        bookingAlerts: emailNotifications,
        settlementAlerts: smsNotifications,
        marketingAlerts: marketingEmails,
      })

      await refetch()
      setIsEditing(false)
      setImagePreview(null)
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save changes. Please try again.')
    }
  }

  if (!session) return null

  const joinDate = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Jan 2024'

  return (
    <div className="font-sans">
      {/* Page Title Header */}
      <div className="mb-6 p-1">
        <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight leading-none">
          My Profile
        </h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">
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
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left User Summary Column */}
            <div className="lg:border-r lg:border-gray-100 lg:pr-8 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-primary/5 border border-gray-100 shadow-sm flex items-center justify-center text-4xl font-extrabold text-primary overflow-hidden relative">
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
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
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
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer text-primary hover:scale-105 active:scale-95 transition-all"
                >
                  <Pencil size={12} className="text-[#3d702d]" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <h4 className="font-extrabold text-gray-900 text-xl mt-4 font-display">
                {session.user.name}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F8F1] text-[#2d5222] text-[10px] font-bold px-3 py-1 mt-2">
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

              {/* Dynamic Contact Details */}
              <div className="mt-8 space-y-4 text-left w-full max-w-[240px]">
                <div className="flex items-center gap-3 text-xs text-gray-600 font-semibold">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">{session.user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 font-semibold">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 font-semibold">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Right Personal Information Form Column */}
            <div className="lg:col-span-2 lg:pl-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-gray-900 text-base font-display">
                  Personal Information
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditClick}
                  className={cn(
                    'h-9 rounded-xl text-xs font-bold transition-all border shrink-0 shadow-none cursor-pointer',
                    isEditing
                      ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100/70 hover:text-red-750'
                      : 'border-[#2d5222] text-[#2d5222] hover:bg-[#2d5222]/5'
                  )}
                >
                  {isEditing ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Pencil size={12} className="mr-1 text-[#2d5222]" />
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
                    className="text-xs font-bold text-gray-400"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      'h-11 rounded-xl border-gray-200 font-semibold text-sm transition-all focus:ring-primary/20',
                      isEditing
                        ? 'bg-white text-gray-900 border-primary ring-2 ring-primary/5'
                        : 'bg-gray-50/50 text-gray-900 disabled:opacity-100 disabled:cursor-default'
                    )}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="gender"
                    className="text-xs font-bold text-gray-400"
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
                        'w-full h-11 px-4 rounded-xl border border-gray-200 font-semibold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-gray-50/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-gray-400',
                        isEditing ? 'bg-white border-primary ring-2 ring-primary/5' : 'bg-gray-50/50 [&>span]:opacity-100'
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
                    className="text-xs font-bold text-gray-400"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={session.user.email}
                    disabled
                    className="h-11 rounded-xl border-gray-200 bg-gray-50/50 text-gray-900 font-semibold text-sm disabled:opacity-100 disabled:cursor-default"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="location"
                    className="text-xs font-bold text-gray-400"
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      'h-11 rounded-xl border-gray-200 font-semibold text-sm transition-all focus:ring-primary/20',
                      isEditing
                        ? 'bg-white text-gray-900 border-primary ring-2 ring-primary/5'
                        : 'bg-gray-50/50 text-gray-900 disabled:opacity-100 disabled:cursor-default'
                    )}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-bold text-gray-400"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      'h-11 rounded-xl border-gray-200 font-semibold text-sm transition-all focus:ring-primary/20',
                      isEditing
                        ? 'bg-white text-gray-900 border-primary ring-2 ring-primary/5'
                        : 'bg-gray-50/50 text-gray-900 disabled:opacity-100 disabled:cursor-default'
                    )}
                  />
                </div>

                {/* Preferred Language */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="language"
                    className="text-xs font-bold text-gray-400"
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
                        'w-full h-11 px-4 rounded-xl border border-gray-200 font-semibold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-gray-50/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-gray-400',
                        isEditing ? 'bg-white border-primary ring-2 ring-primary/5' : 'bg-gray-50/50 [&>span]:opacity-100'
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
                    className="text-xs font-bold text-gray-400"
                  >
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Input
                      id="dob"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      disabled={!isEditing}
                      className={cn(
                        'h-11 pr-10 rounded-xl border-gray-200 font-semibold text-sm transition-all focus:ring-primary/20',
                        isEditing
                          ? 'bg-white text-gray-900 border-primary ring-2 ring-primary/5'
                          : 'bg-gray-50/50 text-gray-900 disabled:opacity-100 disabled:cursor-default'
                      )}
                    />
                    <Calendar
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Save Button */}
              {isEditing && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/95 text-white h-11 px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
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
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h3 className="font-extrabold text-gray-900 text-base font-display">
              Account Security
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium leading-none">
              Manage your password and account security settings.
            </p>

            <div className="mt-6 space-y-4">
              {/* Password */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Password
                  </span>
                  <span className="text-xs text-gray-400 font-semibold mt-0.5 tracking-wider">
                    ••••••••••••
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg px-4 text-xs font-bold text-gray-700 shadow-none border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  Change
                </Button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Two-Factor Authentication
                  </span>
                  <span className="text-[10px] text-[#2d5222] bg-[#F4F8F1] border border-[#e6efe1] font-bold px-2 py-0.5 rounded-full w-fit mt-1.5 leading-none">
                    Enabled
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg px-4 text-xs font-bold text-gray-700 shadow-none border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  Manage
                </Button>
              </div>

              {/* Login Sessions */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Login Sessions
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-0.5">
                    Manage your active sessions
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg px-4 text-xs font-bold text-gray-700 shadow-none border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  View
                </Button>
              </div>

              {/* Devices */}
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Devices
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-0.5">
                    Manage your trusted devices
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg px-4 text-xs font-bold text-gray-700 shadow-none border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2: Preferences */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h3 className="font-extrabold text-gray-900 text-base font-display">
              Preferences
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium leading-none">
              Customize your experience on Vastu.
            </p>

            <div className="mt-6 space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Email Notifications
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-0.5">
                    Stay updated with important updates
                  </span>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    SMS Notifications
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-0.5">
                    Receive text messages for bookings
                  </span>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              {/* Marketing Emails */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Marketing Emails
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-0.5">
                    Receive offers and promotions
                  </span>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>

              {/* Currency */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-gray-900">Currency</span>
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                >
                  <SelectTrigger
                    className="w-28 h-9 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white focus:outline-none cursor-pointer shadow-none"
                  >
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

        {/* ─── Bottom Row: Green Member Banner ─── */}
        <div className="bg-[#F4F8F1] rounded-[32px] border border-[#e6efe1] p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6efe1] text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-[#2d5222] font-display">
                Green Member
              </span>
              <span className="text-xs text-gray-500 font-bold leading-none mt-1">
                You're saving the planet!
              </span>
              <span className="text-[11px] text-gray-400 font-semibold mt-1">
                Thank you for being a part of our sustainable community.
              </span>
            </div>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2d5222] hover:underline shrink-0 cursor-pointer"
          >
            <span>View Impact</span>
            <ChevronRight size={14} className="mt-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
