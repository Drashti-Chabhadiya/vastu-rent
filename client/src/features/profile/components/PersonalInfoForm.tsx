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
import { Pencil, Calendar, MapPin } from 'lucide-react'
import { Loader } from '#/components/ui/loader'
import { useTranslation } from '#/context/TranslationContext'

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

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
  addressLine1: string
  setAddressLine1: (val: string) => void
  addressLine2: string
  setAddressLine2: (val: string) => void
  street: string
  setStreet: (val: string) => void
  city: string
  setCity: (val: string) => void
  state: string
  setState: (val: string) => void
  pincode: string
  setPincode: (val: string) => void
  country: string
  errors: Record<string, string>
}

export function PersonalInfoForm({
  name,
  setName,
  gender,
  setGender,
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
  errors,
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
                ? errors.name
                  ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                  : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
            )}
          />
          {errors.name && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.name}
            </p>
          )}
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
                ? errors.phone
                  ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                  : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
            )}
          />
          {errors.phone && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.phone}
            </p>
          )}
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
              <SelectItem value="English" className="notranslate">
                English
              </SelectItem>
              <SelectItem value="Hindi" className="notranslate">
                हिन्दी (Hindi)
              </SelectItem>
              <SelectItem value="Gujarati" className="notranslate">
                ગુજરાતી (Gujarati)
              </SelectItem>
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

        {/* Rental Address Section */}
        <div className="col-span-full border-t border-border/30 pt-6 mt-4">
          <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-primary" />
            {t('વસ્તુ આપવાનું સરનામું (Rental Address)')}
          </h4>
          <p className="text-[11px] text-muted-foreground/85 font-medium mb-4">
            {t(
              'તમે જે જગ્યાએથી તમારી પ્રોડક્ટ્સ રેન્ટ (Rent) પર આપવા માંગો છો તેનું સાચું સરનામું અહિંયા ભરો.',
            )}
          </p>
        </div>

        {/* Address Line 1 */}
        <div className="space-y-1.5 col-span-full">
          <Label
            htmlFor="addressLine1"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Address Line 1')}
          </Label>
          <Input
            id="addressLine1"
            value={addressLine1}
            placeholder={t('House No., Building Name, Suite')}
            onChange={(e) => setAddressLine1(e.target.value)}
            disabled={!isEditing}
            className={cn(
              'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
              isEditing
                ? errors.addressLine1
                  ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                  : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
            )}
          />
          {errors.addressLine1 && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.addressLine1}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-1.5 col-span-full">
          <Label
            htmlFor="addressLine2"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Address Line 2 (Optional)')}
          </Label>
          <Input
            id="addressLine2"
            value={addressLine2}
            placeholder={t('Floor, Apartment, Phase (Optional)')}
            onChange={(e) => setAddressLine2(e.target.value)}
            disabled={!isEditing}
            className={cn(
              'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
              isEditing
                ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
            )}
          />
        </div>

        {/* Street */}
        <div className="space-y-1.5 col-span-full">
          <Label
            htmlFor="street"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Street / Area')}
          </Label>
          <Input
            id="street"
            value={street}
            placeholder={t('Street name, landmark, locality')}
            onChange={(e) => setStreet(e.target.value)}
            disabled={!isEditing}
            className={cn(
              'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
              isEditing
                ? errors.street
                  ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                  : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
            )}
          />
          {errors.street && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.street}
            </p>
          )}
        </div>

        {/* City & Pincode */}
        <div className="space-y-1.5">
          <Label
            htmlFor="city"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('City')}
          </Label>
          <Input
            id="city"
            value={city}
            placeholder={t('e.g. Surat')}
            onChange={(e) => setCity(e.target.value)}
            disabled={!isEditing}
            className={cn(
              'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
              isEditing
                ? errors.city
                  ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                  : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
            )}
          />
          {errors.city && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.city}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="pincode"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Pincode')}
          </Label>
          <Input
            id="pincode"
            value={pincode}
            maxLength={6}
            placeholder={t('e.g. 395001')}
            onChange={(e) => setPincode(e.target.value)}
            disabled={!isEditing}
            className={cn(
              'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
              isEditing
                ? errors.pincode
                  ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                  : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
            )}
          />
          {errors.pincode && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.pincode}
            </p>
          )}
        </div>

        {/* State & Country */}
        <div className="space-y-1.5">
          <Label
            htmlFor="state"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('State')}
          </Label>
          <Select value={state} onValueChange={setState} disabled={!isEditing}>
            <SelectTrigger
              id="state"
              className={cn(
                'w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-muted-foreground/70',
                isEditing
                  ? errors.state
                    ? 'bg-card border-destructive ring-2 ring-destructive/10'
                    : 'bg-card border-primary ring-2 ring-primary/5'
                  : 'bg-muted-light/50 [&>span]:opacity-100',
              )}
            >
              <SelectValue placeholder={t('Select State')} />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.state}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="country"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Country')}
          </Label>
          <Input
            id="country"
            value={country}
            disabled
            className="h-11 rounded-xl border-border bg-muted-light/50 text-foreground/75 font-semibold text-sm disabled:opacity-100 disabled:cursor-default"
          />
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
