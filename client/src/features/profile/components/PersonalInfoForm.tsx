import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Pencil, Calendar } from 'lucide-react'
import { Loader } from '#/components/ui/loader'
import { useTranslation } from '#/context/TranslationContext'

interface PersonalInfoFormProps {
  name: string
  setName: (val: string) => void
  gender: string
  setGender: (val: string) => void
  location: string
  setLocation: (val: string) => void
  phone: string
  setPhone: (val: string) => void
  language: string
  setLanguage: (val: string) => void
  dob: string
  setDob: (val: string) => void
  email: string
  isEditing: boolean
  handleEditClick: () => void
  handleSaveChanges: () => void
  isSaving: boolean
}

export function PersonalInfoForm({
  name,
  setName,
  gender,
  setGender,
  location,
  setLocation,
  phone,
  setPhone,
  language,
  setLanguage,
  dob,
  setDob,
  email,
  isEditing,
  handleEditClick,
  handleSaveChanges,
  isSaving,
}: PersonalInfoFormProps) {
  const { t } = useTranslation()

  return (
    <div className="lg:col-span-2 lg:pl-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-foreground text-base font-display">
          {t('Personal Information')}
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
            t('Cancel')
          ) : (
            <>
              <Pencil size={12} className="mr-1 text-primary" />
              {t('Edit Profile')}
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
            {t('Full Name')}
          </Label>
          <Input
            id="fullName"
            value={name}
            placeholder={t('Not specified')}
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
            {t('Gender')}
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
              <SelectValue placeholder={t('Select Gender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Female">{t('Female')}</SelectItem>
              <SelectItem value="Male">{t('Male')}</SelectItem>
              <SelectItem value="Other">{t('Other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Email Address')}
          </Label>
          <Input
            id="email"
            value={email}
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
            {t('Location')}
          </Label>
          <Input
            id="location"
            value={location}
            placeholder={t('Not specified')}
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
            {t('Phone Number')}
          </Label>
          <Input
            id="phone"
            value={phone}
            placeholder={t('Not specified')}
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
            {t('Preferred Language')}
          </Label>
          <Select
            value={language}
            onValueChange={setLanguage}
            disabled={!isEditing}
          >
            <SelectTrigger
              id="language"
              translate="no"
              className={cn(
                'notranslate w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-muted-foreground/70',
                isEditing
                  ? 'bg-card border-primary ring-2 ring-primary/5'
                  : 'bg-muted-light/50 [&>span]:opacity-100',
              )}
            >
              <SelectValue placeholder={t('Select Language')} />
            </SelectTrigger>
            <SelectContent className="notranslate" translate="no">
              <SelectItem value="English" className="notranslate">English</SelectItem>
              <SelectItem value="Hindi" className="notranslate">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="Gujarati" className="notranslate">ગુજરાતી (Gujarati)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <Label
            htmlFor="dob"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Date of Birth')}
          </Label>
          <div className="relative">
            <Input
              id="dob"
              value={dob}
              placeholder={t('Not specified')}
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
            {isSaving ? t('Saving...') : t('Save Changes')}
          </Button>
        </div>
      )}
    </div>
  )
}
