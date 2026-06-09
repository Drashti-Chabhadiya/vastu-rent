import { useState, useRef } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { cn } from '#/lib/utils'
import {
  Mail,
  Calendar,
  Camera,
  Phone,
  Pencil,
  Sparkles,
} from 'lucide-react'
import { PersonalInfoForm } from './PersonalInfoForm'
import { ImageEditorModal } from './ImageEditorModal'
import { LoadingOverlay } from '#/components/ui/loader'
import { toast } from 'sonner'
import { useTranslation, normalizeLanguage } from '#/context/TranslationContext'
import { useProfileData } from '#/hook'

export function UserProfileSettingsCard() {
  const {
    name, setName,
    phone, setPhone,
    location, setLocation,
    gender, setGender,
    language, setLanguage,
    dob, setDob,
    currency,
    emailNotifications,
    smsNotifications,
    marketingEmails,
    imagePreview, setImagePreview,
    editorImageSrc, setEditorImageSrc,
    croppedFile, setCroppedFile,
    isEditorOpen, setIsEditorOpen,
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

  const handleEditClick = () => {
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
    <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8 relative">
      {isSaving && (
        <LoadingOverlay
          message={t('Saving profile changes...')}
          className="rounded-[32px] z-50 animate-fade-in"
        />
      )}

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
                    {t('Edit Profile')}
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
            {t('Verified Member')}
          </span>

          {/* Profile Completeness Widget */}
          <div className="w-full mt-6 bg-muted-light/30 border border-border/20 rounded-2xl p-4 text-left">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                {t('Completeness')}
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
                  {t('Pending Details:')}
                </p>
                <ul className="space-y-1 pl-1">
                  {missingFields.map((f) => (
                    <li
                      key={f.key}
                      className="text-[10px] font-semibold text-amber-600 flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                      {t(f.label)}
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
                {t('Profile fully complete!')}
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
                {phone || t('Not specified')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
              <Calendar
                size={16}
                className="text-muted-foreground/70 shrink-0"
              />
              <span>{t('Member since')} {joinDate}</span>
            </div>
          </div>
        </div>

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
        />
      </div>

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
