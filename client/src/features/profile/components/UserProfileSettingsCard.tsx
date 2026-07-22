import { useState, useRef } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { PersonalInfoForm } from './PersonalInfoForm'
import { ImageEditorModal } from './ImageEditorModal'
import { UserProfileSummaryCard } from './UserProfileSummaryCard'
import { LoadingOverlay } from '#/components/ui/loader'
import { toast } from 'sonner'
import { useTranslation, normalizeLanguage } from '#/context/TranslationContext'
import { useProfileData } from '#/hook'

interface UserProfileSettingsCardProps {
  viewSection?: 'all' | 'personal' | 'address'
  hideLeftSummary?: boolean
}

export function UserProfileSettingsCard({
  viewSection = 'all',
  hideLeftSummary = false,
}: UserProfileSettingsCardProps) {
  const {
    name,
    setName,
    phone,
    setPhone,
    location,
    setLocation,
    gender,
    setGender,
    language,
    setLanguage,
    dob,
    setDob,
    currency,
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
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    street,
    setStreet,
    city,
    setCity,
    state,
    setState,
    pincode,
    setPincode,
    country,
    setCountry,
    shopName,
    setShopName,
    addressType,
    setAddressType,
  } = useProfileData()

  const { t, changeLanguage } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSaving = busy

  const handleEditClick = () => {
    setErrors({})
    if (isEditing) {
      setName(session?.user.name || '')
      setImagePreview(null)
      setCroppedFile(null)
      setEditorImageSrc(null)
      setIsEditing(false)
      const originalLang = (session?.user as any)?.language || ''
      setLanguage(originalLang)
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
    const newErrors: Record<string, string> = {}
    if (viewSection === 'all' || viewSection === 'personal') {
      if (!name.trim()) newErrors.name = 'Full Name is required'
      if (phone.trim() && !/^\d{10}$/.test(phone.trim())) {
        newErrors.phone = 'Phone number must be a valid 10-digit number'
      } else if (!phone.trim()) {
        newErrors.phone = 'Phone number is required'
      }
    }

    if (viewSection === 'all' || viewSection === 'address') {
      if (!addressLine1.trim())
        newErrors.addressLine1 = 'Address Line 1 is required'
      if (!street.trim()) newErrors.street = 'Street / Area is required'
      if (!city.trim()) newErrors.city = 'City is required'
      if (!state.trim()) newErrors.state = 'State is required'
      if (!pincode.trim()) {
        newErrors.pincode = 'Pincode is required'
      } else if (!/^\d{6}$/.test(pincode.trim())) {
        newErrors.pincode = 'Pincode must be exactly 6 digits'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error(t('Please fix the errors in the form before saving.'))
      return
    }

    setErrors({})
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
        addressLine1,
        addressLine2,
        street,
        city,
        state,
        pincode,
        country,
        shopName,
        addressType,
        bookingAlerts: emailNotifications,
        settlementAlerts: smsNotifications,
        marketingAlerts: marketingEmails,
      })

      await refetch()
      setIsEditing(false)
      setImagePreview(null)
      setCroppedFile(null)
      setEditorImageSrc(null)
      // Apply language change AFTER save so page reloads with new language
      changeLanguage(normalizeLanguage(language))
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
    { key: 'language', label: 'Preferred Language', value: language },
    { key: 'dob', label: 'Date of Birth', value: dob },
    { key: 'addressLine1', label: 'Address Line 1', value: addressLine1 },
    { key: 'street', label: 'Street / Area', value: street },
    { key: 'city', label: 'City', value: city },
    { key: 'state', label: 'State', value: state },
    { key: 'pincode', label: 'Pincode', value: pincode },
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
        <PersonalInfoForm
          name={name}
          setName={setName}
          gender={gender}
          setGender={setGender}
          location={location}
          setLocation={setLocation}
          phone={phone}
          setPhone={setPhone}
          language={language}
          setLanguage={setLanguage}
          dob={dob}
          setDob={setDob}
          email={session.user.email}
          isEditing={isEditing}
          handleEditClick={handleEditClick}
          handleSaveChanges={handleSaveChanges}
          isSaving={isSaving}
          addressLine1={addressLine1}
          setAddressLine1={setAddressLine1}
          addressLine2={addressLine2}
          setAddressLine2={setAddressLine2}
          street={street}
          setStreet={setStreet}
          city={city}
          setCity={setCity}
          state={state}
          setState={setState}
          pincode={pincode}
          setPincode={setPincode}
          country={country}
          setCountry={setCountry}
          shopName={shopName}
          setShopName={setShopName}
          addressType={addressType}
          setAddressType={setAddressType}
          errors={errors}
          viewSection={viewSection}
        />
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
            phone={phone}
            joinDate={joinDate}
          />

          {/* Right Personal Information Form Column */}
          <PersonalInfoForm
            name={name}
            setName={setName}
            gender={gender}
            setGender={setGender}
            location={location}
            setLocation={setLocation}
            phone={phone}
            setPhone={setPhone}
            language={language}
            setLanguage={setLanguage}
            dob={dob}
            setDob={setDob}
            email={session.user.email}
            isEditing={isEditing}
            handleEditClick={handleEditClick}
            handleSaveChanges={handleSaveChanges}
            isSaving={isSaving}
            addressLine1={addressLine1}
            setAddressLine1={setAddressLine1}
            addressLine2={addressLine2}
            setAddressLine2={setAddressLine2}
            street={street}
            setStreet={setStreet}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
            pincode={pincode}
            setPincode={setPincode}
            country={country}
            setCountry={setCountry}
            shopName={shopName}
            setShopName={setShopName}
            addressType={addressType}
            setAddressType={setAddressType}
            errors={errors}
            viewSection={viewSection}
          />
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

