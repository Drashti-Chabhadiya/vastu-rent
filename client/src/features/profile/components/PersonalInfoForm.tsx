import { useEffect, useState } from 'react'
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
import {
  Pencil,
  Calendar,
  MapPin,
  Home,
  Building2,
  Store,
  Map,
  Navigation,
  Hash,
  Globe,
  Loader2,
} from 'lucide-react'
import { Loader } from '#/components/ui/loader'
import { useTranslation } from '#/context/TranslationContext'
import { LanguageSelector } from '@/components/ui/language-selector'
import { LocationCombobox } from '@/components/ui/location-combobox'
import { usePincodeLookup, useStateSearch } from '#/hook'
import { toast } from 'sonner'

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
  setCountry?: (val: string) => void
  shopName?: string
  setShopName?: (val: string) => void
  addressType?: 'home' | 'shop'
  setAddressType?: (val: 'home' | 'shop') => void
  errors?: Record<string, string>
}

export function PersonalInfoForm({
  name,
  setName,
  gender,
  setGender,
  phone,
  setPhone,
  language: _language,
  setLanguage: _setLanguage,
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
  setCountry,
  shopName = '',
  setShopName,
  addressType = 'home',
  setAddressType,
  errors = {},
}: PersonalInfoFormProps) {
  const { t } = useTranslation()

  const [countryId, setCountryId] = useState<number | undefined>(101) // Default India (ID: 101)
  const [stateId, setStateId] = useState<number | undefined>()

  // Live pincode lookup integration
  const isValidPincodeFormat = Boolean(
    pincode && pincode.length === 6 && /^[1-9][0-9]{5}$/.test(pincode),
  )

  const { data: pincodeData, isLoading: isPincodeLoading } = usePincodeLookup(
    pincode,
    {
      enabled: isEditing && isValidPincodeFormat,
    },
  )

  // State ID search query for dynamic combobox linking
  const { data: matchedStates } = useStateSearch(
    pincodeData?.state || state,
    countryId,
    {
      enabled: Boolean(pincodeData?.state || state),
    },
  )

  // Auto-fill city & state when pincode lookup returns valid details
  useEffect(() => {
    if (isEditing && pincodeData?.valid) {
      if (pincodeData.state) {
        setState(pincodeData.state)
      }
      if (pincodeData.district) {
        setCity(pincodeData.district)
      }
      toast.success(
        `Pincode verified: ${pincodeData.district}, ${pincodeData.state}`,
      )
    }
  }, [pincodeData, isEditing, setState, setCity])

  // Sync stateId when matchedStates resolves from DB
  useEffect(() => {
    const currentStateName = pincodeData?.state || state
    if (matchedStates && matchedStates.length > 0 && currentStateName) {
      const matched =
        matchedStates.find(
          (s) => s.name.toLowerCase() === currentStateName.toLowerCase(),
        ) || matchedStates[0]
      setStateId(matched.id)
    }
  }, [matchedStates, pincodeData, state])

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
            className="text-xs font-bold text-muted-foreground/70 block mb-1"
          >
            {t('Preferred Language')}
          </Label>
          <div className="pt-0.5">
            <LanguageSelector className="w-full justify-between h-11 px-4 rounded-xl border-border bg-card font-semibold text-sm shadow-none" />
          </div>
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

        {/* Rental Address Section Header */}
        <div className="col-span-full border-t border-border/30 pt-6 mt-4">
          <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-primary" />
            {t('Rental Address')}
          </h4>
          <p className="text-[11px] text-muted-foreground/85 font-medium mb-4">
            {t('Rental Address Subtitle')}
          </p>
        </div>

        {/* Address Type Toggle (Home vs Shop Address) */}
        <div className="col-span-full rounded-2xl border border-border/40 bg-muted/20 p-4 mb-1">
          <p className="text-[12px] font-bold text-foreground mb-2.5">
            {t('Address Type')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!isEditing}
              onClick={() => setAddressType?.('home')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                addressType === 'home'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Home className="h-4 w-4" strokeWidth={2} />
              {t('Home Address')}
            </button>
            <button
              type="button"
              disabled={!isEditing}
              onClick={() => setAddressType?.('shop')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                addressType === 'shop'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Building2 className="h-4 w-4" strokeWidth={2} />
              {t('Shop Address')}
            </button>
          </div>
        </div>

        {/* Shop / Home Name */}
        <div className="space-y-1.5 col-span-full">
          <Label
            htmlFor="shopName"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {addressType === 'shop'
              ? t('Shop Name')
              : t('Shop / Home Name (Optional)')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              {addressType === 'shop' ? (
                <Store className="h-4 w-4 text-muted-foreground/60" />
              ) : (
                <Home className="h-4 w-4 text-muted-foreground/60" />
              )}
            </div>
            <Input
              id="shopName"
              value={shopName}
              placeholder={
                addressType === 'shop'
                  ? t('e.g. Raju Camera Store')
                  : t("e.g. Ramesh's Home")
              }
              onChange={(e) => setShopName?.(e.target.value)}
              disabled={!isEditing}
              className={cn(
                'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                isEditing
                  ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                  : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
              )}
            />
          </div>
        </div>

        {/* Address Line 1 */}
        <div className="space-y-1.5 col-span-full">
          <Label
            htmlFor="addressLine1"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Address Line 1')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Home className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <Input
              id="addressLine1"
              value={addressLine1}
              placeholder={t('House No., Building Name, Suite')}
              onChange={(e) => setAddressLine1(e.target.value)}
              disabled={!isEditing}
              className={cn(
                'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                isEditing
                  ? errors.addressLine1
                    ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                    : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                  : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
              )}
            />
          </div>
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Building2 className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <Input
              id="addressLine2"
              value={addressLine2}
              placeholder={t('Floor, Apartment, Phase (Optional)')}
              onChange={(e) => setAddressLine2(e.target.value)}
              disabled={!isEditing}
              className={cn(
                'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                isEditing
                  ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                  : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
              )}
            />
          </div>
        </div>

        {/* Street */}
        <div className="space-y-1.5 col-span-full">
          <Label
            htmlFor="street"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Street / Area')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Map className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <Input
              id="street"
              value={street}
              placeholder={t('Street name, landmark, locality')}
              onChange={(e) => setStreet(e.target.value)}
              disabled={!isEditing}
              className={cn(
                'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                isEditing
                  ? errors.street
                    ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                    : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                  : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
              )}
            />
          </div>
          {errors.street && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.street}
            </p>
          )}
        </div>

        {/* Pincode (with Live Auto-fill & Loader) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="pincode"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Pincode')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Hash className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <Input
              id="pincode"
              value={pincode}
              maxLength={6}
              placeholder={t('e.g. 395001')}
              onChange={(e) => setPincode(e.target.value)}
              disabled={!isEditing}
              className={cn(
                'h-11 pl-10 pr-9 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                isEditing
                  ? errors.pincode
                    ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                    : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                  : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
              )}
            />
            {isPincodeLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
            )}
          </div>
          {errors.pincode && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.pincode}
            </p>
          )}
        </div>

        {/* City (Dynamic LocationCombobox) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="city"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('City')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Navigation className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <LocationCombobox
              type="city"
              value={city}
              parentId={stateId}
              onChange={(val) => {
                setCity(val)
              }}
              placeholder={t('Search city...')}
              disabled={!isEditing}
              className="h-11 pl-10"
            />
          </div>
          {errors.city && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.city}
            </p>
          )}
        </div>

        {/* State (Dynamic LocationCombobox) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="state"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('State')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <MapPin className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <LocationCombobox
              type="state"
              value={state}
              parentId={countryId}
              onChange={(val, id) => {
                setState(val)
                setStateId(id)
                setCity('')
              }}
              placeholder={t('Search state...')}
              disabled={!isEditing}
              className="h-11 pl-10"
            />
          </div>
          {errors.state && (
            <p className="text-[11px] font-bold text-destructive mt-1 animate-in fade-in duration-200">
              {errors.state}
            </p>
          )}
        </div>

        {/* Country (Dynamic LocationCombobox) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="country"
            className="text-xs font-bold text-muted-foreground/70"
          >
            {t('Country')}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Globe className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <LocationCombobox
              type="country"
              value={country}
              onChange={(val, id) => {
                setCountry?.(val)
                setCountryId(id)
                setStateId(undefined)
                setState('')
                setCity('')
              }}
              placeholder={t('Search country...')}
              disabled={!isEditing}
              className="h-11 pl-10"
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
