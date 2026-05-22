import { useState, useEffect, useMemo } from 'react'
import {
  ChevronRight,
  Calendar,
  User,
  Bell,
  CreditCard,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { authClient } from '#/lib/auth/auth-client'
import {
  useUploadProfileImage,
  useUpdateUserSettings,
  useCloudinaryUsage,
} from '#/hook'
import { apiClient } from '#/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Import extracted sub-components
import { ProfileSettingsForm } from './components/ProfileSettingsForm'
import { PayoutSettingsForm } from './components/PayoutSettingsForm'
import { NotificationSettingsForm } from './components/NotificationSettingsForm'
import { CloudinarySettingsForm } from './components/CloudinarySettingsForm'
import { StorageDetailsDialog } from './components/StorageDetailsDialog'

// Pure helper — lives outside the component so it never changes reference.
const formatBytes = (
  bytes: number,
  decimals: number = 1,
): { value: string; unit: string } => {
  if (bytes === 0) return { value: '0', unit: 'GB' }
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return {
    value: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toString(),
    unit: sizes[i],
  }
}

export const SettingsManagement = () => {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const activeUser = session?.user

  // Active Tab State
  const [activeSubTab, setActiveSubTab] = useState('profile')

  // Profile Edit States
  const [profileName, setProfileName] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Payout/Bank Settings States
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [upiId, setUpiId] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  // Notification Preferences States
  const [bookingAlerts, setBookingAlerts] = useState(true)
  const [settlementAlerts, setSettlementAlerts] = useState(true)
  const [marketingAlerts, setMarketingAlerts] = useState(false)

  // Cloudinary Integration States
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('')
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('')
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('')
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('')
  const [cloudinaryHasSecret, setCloudinaryHasSecret] = useState(false)
  const [isTestingCloudinary, setIsTestingCloudinary] = useState(false)
  const [isSavingCloudinary, setIsSavingCloudinary] = useState(false)
  const [isLoadingCloudinary, setIsLoadingCloudinary] = useState(false)

  // Profile Image Upload Hook & Settings Update Hook
  const uploadProfileImg = useUploadProfileImage()
  const updateSettings = useUpdateUserSettings()

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Fetch real-time Cloudinary usage metrics — staleTime prevents
  // session re-polls from causing the storage value to flicker.
  const isCloudinaryTabActive =
    activeSubTab === 'cloudinary' && activeUser !== undefined
  const { data: usageData, refetch: refetchUsage } = useCloudinaryUsage({
    enabled: isCloudinaryTabActive,
    staleTime: 60_000, // treat data as fresh for 60 s
    refetchOnWindowFocus: false, // avoid refetch noise on focus
  })

  // Memoize derived storage stats so they only recompute when usageData changes,
  // not on every parent render (which was causing the blink).
  const { formattedUsed, formattedLimit, usedPercent } =
    useMemo(() => {
      const stats = usageData?.storage || {
        usage: 0,
        limit: 10485760000,
        used_percent: 0,
      }
      return {
        formattedUsed: formatBytes(stats.usage),
        formattedLimit: formatBytes(stats.limit),
        usedPercent: Math.min(100, Math.max(0, stats.used_percent)),
      }
    }, [usageData])

  // Load Cloudinary config when active tab is selected
  useEffect(() => {
    if (activeSubTab === 'cloudinary' && activeUser) {
      setIsLoadingCloudinary(true)
      apiClient
        .get('/users/settings/cloudinary')
        .then((res) => {
          const config = res.data.config
          if (config) {
            setCloudinaryCloudName(config.cloudName || '')
            setCloudinaryApiKey(config.apiKey || '')
            setCloudinaryUploadPreset(config.uploadPreset || '')
            setCloudinaryHasSecret(config.hasSecret || false)
          } else {
            setCloudinaryCloudName('')
            setCloudinaryApiKey('')
            setCloudinaryUploadPreset('')
            setCloudinaryHasSecret(false)
          }
        })
        .catch(() => {
          toast.error('Failed to load Cloudinary settings')
        })
        .finally(() => {
          setIsLoadingCloudinary(false)
        })
    }
  }, [activeSubTab, activeUser])

  // Handle Save Cloudinary Config
  const handleSaveCloudinary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cloudinaryCloudName.trim() || !cloudinaryApiKey.trim()) {
      toast.error('Cloud Name and API Key are required')
      return
    }
    if (!cloudinaryHasSecret && !cloudinaryApiSecret.trim()) {
      toast.error('API Secret is required for new configurations')
      return
    }

    setIsSavingCloudinary(true)
    try {
      const payload: any = {
        cloudName: cloudinaryCloudName.trim(),
        apiKey: cloudinaryApiKey.trim(),
        uploadPreset: cloudinaryUploadPreset.trim() || undefined,
      }
      if (cloudinaryApiSecret.trim()) {
        payload.apiSecret = cloudinaryApiSecret.trim()
      }

      await apiClient.post('/users/settings/cloudinary', payload)
      toast.success('Cloudinary credentials successfully saved and secured! ☁️')
      setCloudinaryHasSecret(true)
      setCloudinaryApiSecret('')
      refetchUsage()
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Failed to save Cloudinary settings',
      )
    } finally {
      setIsSavingCloudinary(false)
    }
  }

  // Handle Test Cloudinary Connection
  const handleTestCloudinary = async () => {
    if (!cloudinaryCloudName.trim() || !cloudinaryApiKey.trim()) {
      toast.error('Cloud Name and API Key are required to test')
      return
    }
    if (!cloudinaryHasSecret && !cloudinaryApiSecret.trim()) {
      toast.error('API Secret is required to test')
      return
    }

    setIsTestingCloudinary(true)
    const promise = apiClient.post('/users/settings/cloudinary/test', {
      cloudName: cloudinaryCloudName.trim(),
      apiKey: cloudinaryApiKey.trim(),
      apiSecret: cloudinaryApiSecret.trim() || undefined,
    })

    toast.promise(promise, {
      loading: 'Testing Cloudinary connection...',
      success: () => {
        setIsTestingCloudinary(false)
        refetchUsage()
        return 'Successfully connected to Cloudinary! ☁️🎉'
      },
      error: (err) => {
        setIsTestingCloudinary(false)
        return (
          err.response?.data?.message ||
          err.message ||
          'Failed to connect. Please verify keys.'
        )
      },
    })
  }

  // Load user session details dynamically
  useEffect(() => {
    if (activeUser) {
      setProfileName(activeUser.name || '')
      setProfileImage(activeUser.image || '')
      setBankName((activeUser as any).bankName || '')
      setAccountNumber((activeUser as any).accountNumber || '')
      setIfscCode((activeUser as any).ifscCode || '')
      setUpiId((activeUser as any).upiId || '')
      setAccountHolder(
        (activeUser as any).accountHolder || activeUser.name || '',
      )
      setBookingAlerts((activeUser as any).bookingAlerts !== false)
      setSettlementAlerts((activeUser as any).settlementAlerts !== false)
      setMarketingAlerts((activeUser as any).marketingAlerts === true)
    }
  }, [activeUser])

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setIsSavingProfile(true)
    try {
      await authClient.updateUser({
        name: profileName,
        image: profileImage,
      })
      toast.success('Profile successfully updated in database! 🎉')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile info')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle Profile Picture Picker Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const promise = uploadProfileImg.mutateAsync(file)
    toast.promise(promise, {
      loading: 'Uploading new profile photo to Cloudinary...',
      success: (data) => {
        // Direct response returns user image
        const imgUrl = data.user?.image || profileImage
        setProfileImage(imgUrl)
        return 'Profile picture successfully uploaded!'
      },
      error: 'Failed to upload photo.',
    })
  }

  // Handle Bank Account Save via API Mutation
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings.mutate(
      {
        bankName,
        accountNumber,
        ifscCode,
        upiId,
        accountHolder,
      },
      {
        onSuccess: () => {
          toast.success(
            'Payout Bank details successfully saved in Database! 🏦',
          )
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              'Failed to save bank details',
          )
        },
      },
    )
  }

  // Handle Notifications Switch Changes via API Mutation
  const handleNotificationToggle = (key: string, val: boolean) => {
    const payload: any = {}
    if (key === 'bookingAlerts') {
      setBookingAlerts(val)
      payload.bookingAlerts = val
    }
    if (key === 'settlementAlerts') {
      setSettlementAlerts(val)
      payload.settlementAlerts = val
    }
    if (key === 'marketingAlerts') {
      setMarketingAlerts(val)
      payload.marketingAlerts = val
    }

    updateSettings.mutate(payload, {
      onSuccess: () => {
        toast.success('Notification preferences updated in database!')
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            'Failed to update notification settings',
        )
      },
    })
  }

  if (isSessionLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 bg-gray-150 rounded-md w-32" />
          <div className="h-6 bg-gray-250 rounded-lg w-48" />
        </div>
        <div className="h-[400px] bg-white border border-slate-100 rounded-[2rem] shadow-sm" />
      </div>
    )
  }

  const isDashboardRole =
    activeUser?.role === 'owner' ||
    activeUser?.role === 'admin' ||
    activeUser?.role === 'superAdmin'

  const sidebarItems = [
    {
      id: 'profile',
      label: 'Profile Settings',
      desc: 'Update your profile information',
      icon: User,
    },
    {
      id: 'payment',
      label: 'Payout Settings',
      desc: 'Configure bank and settlement methods',
      icon: CreditCard,
    },
    {
      id: 'notifications',
      label: 'Notification Preferences',
      desc: 'Control your alert preferences',
      icon: Bell,
    },
    ...(isDashboardRole
      ? [
          {
            id: 'cloudinary',
            label: 'Cloudinary Storage',
            desc: 'Manage your custom storage keys',
            icon: Upload,
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold">Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800">Settings</h1>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <Calendar size={14} className="text-dash-brand" />
            <span className="text-xs font-black text-slate-600 tracking-wider">
              {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar: Settings Navigation */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit space-y-1">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveSubTab(item.id)}
              className={`w-full flex items-center justify-start gap-4 p-4 h-auto rounded-2xl transition-all text-left group cursor-pointer active:scale-[0.98] ${
                activeSubTab === item.id
                  ? 'bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light hover:text-dash-brand'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  activeSubTab === item.id
                    ? 'bg-white shadow-sm text-dash-brand'
                    : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
                }`}
              >
                <item.icon
                  size={16}
                  strokeWidth={activeSubTab === item.id ? 2.5 : 2}
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-black leading-tight">
                  {item.label}
                </p>
                <p
                  className={`text-[9px] font-bold truncate ${
                    activeSubTab === item.id
                      ? 'text-dash-brand'
                      : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </Button>
          ))}
        </div>

        {/* Middle Column: Dynamic Forms */}
        <div className="xl:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          {activeSubTab === 'profile' && (
            <ProfileSettingsForm
              profileName={profileName}
              setProfileName={setProfileName}
              profileImage={profileImage}
              setProfileImage={setProfileImage}
              isSavingProfile={isSavingProfile}
              activeUser={activeUser}
              handleSaveProfile={handleSaveProfile}
              handleImageUpload={handleImageUpload}
            />
          )}

          {activeSubTab === 'payment' && (
            <PayoutSettingsForm
              upiId={upiId}
              setUpiId={setUpiId}
              accountHolder={accountHolder}
              setAccountHolder={setAccountHolder}
              bankName={bankName}
              setBankName={setBankName}
              accountNumber={accountNumber}
              setAccountNumber={setAccountNumber}
              ifscCode={ifscCode}
              setIfscCode={setIfscCode}
              handleSaveBankDetails={handleSaveBankDetails}
            />
          )}

          {activeSubTab === 'notifications' && (
            <NotificationSettingsForm
              bookingAlerts={bookingAlerts}
              settlementAlerts={settlementAlerts}
              marketingAlerts={marketingAlerts}
              handleNotificationToggle={handleNotificationToggle}
            />
          )}

          {activeSubTab === 'cloudinary' && (
            <CloudinarySettingsForm
              cloudinaryCloudName={cloudinaryCloudName}
              setCloudinaryCloudName={setCloudinaryCloudName}
              cloudinaryApiKey={cloudinaryApiKey}
              setCloudinaryApiKey={setCloudinaryApiKey}
              cloudinaryApiSecret={cloudinaryApiSecret}
              setCloudinaryApiSecret={setCloudinaryApiSecret}
              cloudinaryUploadPreset={cloudinaryUploadPreset}
              setCloudinaryUploadPreset={setCloudinaryUploadPreset}
              cloudinaryHasSecret={cloudinaryHasSecret}
              isTestingCloudinary={isTestingCloudinary}
              isSavingCloudinary={isSavingCloudinary}
              isLoadingCloudinary={isLoadingCloudinary}
              handleTestCloudinary={handleTestCloudinary}
              handleSaveCloudinary={handleSaveCloudinary}
              formattedUsed={formattedUsed}
              formattedLimit={formattedLimit}
              usedPercent={usedPercent}
              setIsDetailsModalOpen={setIsDetailsModalOpen}
            />
          )}
        </div>

        {/* Right Column: Account Summary Info */}
        <div className="space-y-6">
          {/* Account Details summary */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[13px] font-black text-slate-800 mb-6 uppercase tracking-widest">
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Account Type
                </span>
                <Badge className="bg-dash-brand-light text-dash-brand border-none font-black text-[9px] px-2.5 capitalize">
                  {activeUser?.role || 'Lister'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Member Since
                </span>
                <span className="text-[11px] font-black text-slate-700">
                  {activeUser?.createdAt
                     ? format(new Date(activeUser.createdAt), 'dd MMM yyyy')
                     : '01 Jan 2026'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Database ID
                </span>
                <span
                  className="text-[10px] font-black text-slate-700 max-w-[120px] truncate"
                  title={activeUser?.id}
                >
                  {activeUser?.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Email Status
                </span>
                <span className="text-[11px] font-black text-dash-brand uppercase tracking-widest">
                  {activeUser?.emailVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Secure Details Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-dash-brand" />
              Safety Guarantee
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              Your details are protected using industry-grade SSL encryption and
              are kept confidential.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Details Dialog */}
      <StorageDetailsDialog
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        usageData={usageData}
        cloudinaryCloudName={cloudinaryCloudName}
        usedPercent={usedPercent}
        formattedUsed={formattedUsed}
        formattedLimit={formattedLimit}
      />
    </div>
  )
}
