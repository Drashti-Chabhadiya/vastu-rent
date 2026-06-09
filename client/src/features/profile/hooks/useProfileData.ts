import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '#/lib/auth/auth-client'
import { useUploadProfileImage, useUpdateUserSettings } from '#/hook'
import { toast } from 'sonner'
import { useTranslation, normalizeLanguage } from '#/context/TranslationContext'

export function useProfileData() {
  const { t, changeLanguage } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState('')
  const [language, setLanguage] = useState('')
  const [dob, setDob] = useState('')
  const [currency, setCurrency] = useState('INR')
  
  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  // Modal visibility states
  const [pwOpen, setPwOpen] = useState(false)
  const [tfaOpen, setTfaOpen] = useState(false)
  const [sessOpen, setSessOpen] = useState(false)
  const [devOpen, setDevOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Image editing/upload states
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadProfileImage()

  const { mutateAsync: updateSettings, isPending: isSavingSettings } =
    useUpdateUserSettings()

  const busy = isUploadingImage || isSavingSettings

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
    if (session?.user) {
      const u = session.user as any
      setName(u.name || '')
      setPhone(u.phone || '')
      setLocation(u.location || '')
      setBio(u.bio || '')
      setGender(u.gender || '')
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
    key: 'email' | 'sms' | 'marketing' | 'push',
    newValue: boolean,
  ) => {
    const prev = {
      email: emailNotifications,
      sms: smsNotifications,
      marketing: marketingEmails,
      push: pushNotifications,
    }

    if (key === 'email') setEmailNotifications(newValue)
    if (key === 'sms') setSmsNotifications(newValue)
    if (key === 'marketing') setMarketingEmails(newValue)
    if (key === 'push') setPushNotifications(newValue)

    try {
      await updateSettings({
        bookingAlerts: key === 'email' ? newValue : prev.email,
        settlementAlerts: key === 'sms' ? newValue : prev.sms,
        marketingAlerts: key === 'marketing' ? newValue : prev.marketing,
      })
      toast.success(t('Preferences auto-saved successfully!'))
    } catch (error) {
      console.error('Failed to update preference:', error)
      toast.error(t('Failed to update preference.'))
      if (key === 'email') setEmailNotifications(prev.email)
      if (key === 'sms') setSmsNotifications(prev.sms)
      if (key === 'marketing') setMarketingEmails(prev.marketing)
      if (key === 'push') setPushNotifications(prev.push)
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency)
    try {
      await updateSettings({
        currency: newCurrency,
      })
      toast.success(`${t('Currency')} set to ${newCurrency}`)
    } catch (error) {
      console.error('Failed to update currency:', error)
      toast.error(t('Failed to update currency.'))
    }
  }

  const handleToggleTwoFactor = async (enabled: boolean) => {
    try {
      await updateSettings({
        twoFactorEnabled: enabled,
      })
      setTwoFactorEnabled(enabled)
    } catch (error) {
      console.error('Failed to update 2FA status:', error)
      toast.error(t('Failed to update 2FA settings.'))
    }
  }

  return {
    t,
    changeLanguage,
    normalizeLanguage,
    
    // States
    name,
    setName,
    phone,
    setPhone,
    location,
    setLocation,
    bio,
    setBio,
    gender,
    setGender,
    language,
    setLanguage,
    dob,
    setDob,
    currency,
    setCurrency,
    
    // Notifications preferences
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications,
    marketingEmails,
    setMarketingEmails,
    pushNotifications,
    setPushNotifications,
    
    // Modal controls
    pwOpen,
    setPwOpen,
    tfaOpen,
    setTfaOpen,
    sessOpen,
    setSessOpen,
    devOpen,
    setDevOpen,
    twoFactorEnabled,
    setTwoFactorEnabled,
    
    // Image cropping & upload
    imagePreview,
    setImagePreview,
    editorImageSrc,
    setEditorImageSrc,
    croppedFile,
    setCroppedFile,
    isEditorOpen,
    setIsEditorOpen,
    
    // Loading/Session states
    session,
    refetch,
    busy,
    uploadImage,
    updateSettings,
    
    // Handlers
    handleTogglePreference,
    handleCurrencyChange,
    handleToggleTwoFactor,
  }
}
