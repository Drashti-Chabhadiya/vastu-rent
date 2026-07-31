import { useState, useRef, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { PersonalInfoForm } from './PersonalInfoForm'
import { ImageEditorModal } from './ImageEditorModal'
import { UserProfileSummaryCard } from './UserProfileSummaryCard'
import { LoadingOverlay } from '#/components/ui/loader'
import { toast } from 'sonner'
import { useTranslation, normalizeLanguage } from '#/context/TranslationContext'
import { useProfileData, useCreateAddress, useUpdateAddress } from '#/hook'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, personalSchema, addressSchema } from '#/schema'
import type { ProfileSchema } from '#/schema'
import { Form } from '#/components/ui/form'

interface UserProfileSettingsCardProps {
  viewSection?: 'all' | 'personal' | 'address'
  hideLeftSummary?: boolean
}

export function UserProfileSettingsCard({
  viewSection = 'all',
  hideLeftSummary = false,
}: UserProfileSettingsCardProps) {
  const {
    emailNotifications,
    smsNotifications,
    marketingEmails,
    imagePreview,
    setImagePreview,
    editorImageSrc,
    setEditorImageSrc,
    croppedFile,
    setCroppedFile,
    isEditorOpen,
    setIsEditorOpen,
    session,
    refetch,
    busy,
    uploadImage,
    updateSettings,
  } = useProfileData()

  const { t, changeLanguage } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSaving = busy

  const formatGender = (val?: string) => {
    if (!val || !val.trim()) return ''
    const trimmed = val.trim()
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  const getFormValues = (): ProfileSchema => {
    const u = (session?.user as any) || {}
    const mainAddr = u.address || u.addresses?.[0] || {}
    return {
      name: session?.user?.name || '',
      gender: formatGender(u.gender),
      phone: u.phone || '',
      language: u.language || 'en',
      dob: u.dob || '',
      addressType:
        mainAddr.addressType?.toLowerCase() === 'shop' ? 'shop' : 'home',
      shopName: mainAddr.shopName || '',
      addressLine1: mainAddr.addressLine1 || '',
      addressLine2: mainAddr.addressLine2 || '',
      street: mainAddr.street || '',
      city: mainAddr.city || '',
      state: mainAddr.state || '',
      pincode: mainAddr.pincode || '',
      country: mainAddr.country || 'India',
      googleMapLink: mainAddr.googleMapLink || '',
      instagramUrl: u.instagramUrl || '',
      facebookUrl: u.facebookUrl || '',
    }
  }

  const activeSchema =
    viewSection === 'personal'
      ? personalSchema
      : viewSection === 'address'
        ? addressSchema
        : profileSchema

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(activeSchema) as any,
    defaultValues: getFormValues(),
  })

  // Sync form with profile data when session loads
  useEffect(() => {
    if (!isEditing) {
      form.reset(getFormValues())
    }
  }, [session, isEditing, form])

  // Reset form when editing starts to grab latest data from session/profile hook
  const handleEditClick = () => {
    if (isEditing) {
      setImagePreview(null)
      setCroppedFile(null)
      setEditorImageSrc(null)
      setIsEditing(false)
      form.reset(getFormValues())
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

  const createAddressMutation = useCreateAddress()
  const updateAddressMutation = useUpdateAddress()

  const onSubmit = async (values: ProfileSchema) => {
    try {
      // 1. Update name via better-auth if edited
      if (values.name?.trim() && values.name.trim() !== session?.user.name) {
        await authClient.updateUser({
          name: values.name.trim(),
        })
      }

      // 2. Upload cropped image if chosen
      if (croppedFile) {
        await uploadImage(croppedFile)
      }

      // 3. Update personal settings (if viewing personal or all)
      if (viewSection === 'personal' || viewSection === 'all') {
        const payload: Record<string, any> = {
          bookingAlerts: emailNotifications,
          settlementAlerts: smsNotifications,
          marketingAlerts: marketingEmails,
        }
        if (values.gender) payload.gender = values.gender
        if (values.phone) payload.phone = values.phone
        if (values.language) payload.language = values.language
        if (values.dob) payload.dob = values.dob
        if (values.instagramUrl !== undefined)
          payload.instagramUrl = values.instagramUrl
        if (values.facebookUrl !== undefined)
          payload.facebookUrl = values.facebookUrl
        await updateSettings(payload)
      }

      // 4. Update or Create Address via dedicated /api/addresses API
      if (viewSection === 'address' || viewSection === 'all') {
        const addressData = {
          addressType: values.addressType,
          shopName: values.shopName,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          street: values.street,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          country: values.country,
          googleMapLink: values.googleMapLink,
        }

        const existingAddressId =
          (session?.user as any)?.address?.id ||
          (session?.user as any)?.addresses?.[0]?.id
        if (existingAddressId) {
          await updateAddressMutation.mutateAsync({
            id: existingAddressId,
            data: addressData,
          })
        } else if (values.addressLine1 || values.city) {
          await createAddressMutation.mutateAsync(addressData)
        }
      }

      await refetch()
      form.reset(values)

      setIsEditing(false)
      setImagePreview(null)
      setCroppedFile(null)
      setEditorImageSrc(null)

      if (values.language) {
        changeLanguage(normalizeLanguage(values.language))
      }
      toast.success(t('Profile changes saved successfully!'))
    } catch (error) {
      console.error('Save failed:', error)
      toast.error(t('Failed to save changes. Please try again.'))
    }
  }

  if (!session) return null

  const joinDate = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Jan 2024'

  const formValues = form.watch()
  const fields = [
    { key: 'name', label: 'Full Name', value: formValues.name },
    { key: 'email', label: 'Email Address', value: session?.user?.email },
    {
      key: 'image',
      label: 'Profile Photo',
      value: session?.user?.image || imagePreview,
    },
    { key: 'phone', label: 'Phone Number', value: formValues.phone },
    { key: 'gender', label: 'Gender', value: formValues.gender },
    {
      key: 'language',
      label: 'Preferred Language',
      value: formValues.language,
    },
    { key: 'dob', label: 'Date of Birth', value: formValues.dob },
    {
      key: 'addressLine1',
      label: 'Address Line 1',
      value: formValues.addressLine1,
    },
    { key: 'street', label: 'Street / Area', value: formValues.street },
    { key: 'city', label: 'City', value: formValues.city },
    { key: 'state', label: 'State', value: formValues.state },
    { key: 'pincode', label: 'Pincode', value: formValues.pincode },
  ]

  const filledFields = fields.filter((f) => f.value && f.value.trim() !== '')
  const missingFields = fields.filter((f) => !f.value || f.value.trim() === '')
  const completenessPercent = Math.round(
    (filledFields.length / fields.length) * 100,
  )

  return (
    <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-6 sm:p-8 relative">
      {isSaving && (
        <LoadingOverlay
          message={t('Saving profile changes...')}
          className="rounded-[32px] z-50 animate-fade-in"
        />
      )}

      {hideLeftSummary ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PersonalInfoForm
              form={form}
              email={session?.user.email || ''}
              isEditing={isEditing}
              handleEditClick={handleEditClick}
              isSaving={isSaving}
              viewSection={viewSection}
            />
          </form>
        </Form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left User Summary Column (Reusable & Mobile Responsive) */}
          <UserProfileSummaryCard
            session={session}
            imagePreview={imagePreview}
            isEditing={isEditing}
            handleImageClick={handleImageClick}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            completenessPercent={completenessPercent}
            missingFields={missingFields}
            phone={form.watch('phone') || ''}
            joinDate={joinDate}
          />

          {/* Right Personal Information Form Column */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <PersonalInfoForm
                  form={form}
                  email={session?.user.email || ''}
                  isEditing={isEditing}
                  handleEditClick={handleEditClick}
                  isSaving={isSaving}
                  viewSection={viewSection}
                />
              </form>
            </Form>
          </div>
        </div>
      )}

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
