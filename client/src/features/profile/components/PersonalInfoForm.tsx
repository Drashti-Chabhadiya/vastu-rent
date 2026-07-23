import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ProfileSchema } from '#/schema'
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import {
  Pencil,
  MapPin,
  Home,
  Building2,
  Store,
  Map,
  Hash,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'
import { LocationCombobox } from '@/components/ui/location-combobox'
import { usePincodeLookup, useStateSearch } from '#/hook'
import { toast } from 'sonner'

interface PersonalInfoFormProps {
  form: UseFormReturn<ProfileSchema, any, any>
  email: string
  isEditing: boolean
  handleEditClick: () => void
  isSaving: boolean
  viewSection?: 'all' | 'personal' | 'address'
}

export function PersonalInfoForm({
  form,
  email,
  isEditing,
  handleEditClick,
  isSaving,
  viewSection = 'all',
}: PersonalInfoFormProps) {
  const { t } = useTranslation()

  const pincode = form.watch('pincode')
  const addressType = form.watch('addressType')
  const stateVal = form.watch('state')

  const lastVerifiedPincode = useRef<string | null>(pincode)

  const [countryId] = useState<number | undefined>(101) // Default India (ID: 101)
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
    pincodeData?.state || stateVal,
    countryId,
    {
      enabled: Boolean(pincodeData?.state || stateVal),
    },
  )

  // Reset when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      lastVerifiedPincode.current = pincode
    }
  }, [isEditing, pincode])

  // Auto-fill city & state when pincode lookup returns valid details
  useEffect(() => {
    if (
      isEditing &&
      pincodeData?.valid &&
      pincodeData.pincode !== lastVerifiedPincode.current
    ) {
      if (pincodeData.state) {
        form.setValue('state', pincodeData.state, { shouldValidate: true })
      }
      if (pincodeData.district) {
        form.setValue('city', pincodeData.district, { shouldValidate: true })
      }
      toast.success(
        `Pincode verified: ${pincodeData.district}, ${pincodeData.state}`,
      )
      lastVerifiedPincode.current = pincodeData.pincode || pincode
    }
  }, [pincodeData, isEditing, pincode, form])

  // Sync stateId when matchedStates resolves from DB
  useEffect(() => {
    const currentStateName = pincodeData?.state || stateVal
    if (matchedStates && matchedStates.length > 0 && currentStateName) {
      const matched =
        matchedStates.find(
          (s) => s.name.toLowerCase() === currentStateName.toLowerCase(),
        ) || matchedStates[0]
      setStateId(matched.id)
    }
  }, [matchedStates, pincodeData, stateVal])

  return (
    <div className="lg:col-span-2 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-foreground text-base font-display">
            {viewSection === 'personal'
              ? t('Personal Information')
              : viewSection === 'address'
                ? t('Rental Address')
                : t('Personal & Address Details')}
          </h3>
          <p className="text-xs text-muted-foreground/80 font-medium mt-0.5">
            {viewSection === 'personal'
              ? t('Manage your account identity and contact information.')
              : viewSection === 'address'
                ? t(
                  'Manage your primary rental address for bookings and items.',
                )
                : t('Manage your personal and rental address information.')}
          </p>
        </div>
        <Button
          type="button"
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
        {/* ─── Personal Information Fields ─── */}
        {(viewSection === 'all' || viewSection === 'personal') && (
          <>
            <FormField<ProfileSchema>
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Full Name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Not specified')}
                      {...field}
                      disabled={!isEditing}
                      className={cn(
                        'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                        isEditing
                          ? form.formState.errors.name
                            ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                            : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                          : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="gender"
              render={({ field }) => {
                const normalizedValue = field.value?.trim()
                  ? field.value.trim().charAt(0).toUpperCase() +
                  field.value.trim().slice(1).toLowerCase()
                  : ''
                return (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-muted-foreground/70">
                      {t('Gender')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={normalizedValue || undefined}
                      disabled={!isEditing}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            'w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-muted-foreground/70',
                            isEditing
                              ? 'bg-card border-primary ring-2 ring-primary/5'
                              : 'bg-muted-light/50 [&>span]:opacity-100',
                          )}
                        >
                          <SelectValue placeholder={t('Select Gender')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Female">{t('Female')}</SelectItem>
                        <SelectItem value="Male">{t('Male')}</SelectItem>
                        <SelectItem value="Other">{t('Other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px] font-bold mt-1" />
                  </FormItem>
                )
              }}
            />

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

            <FormField<ProfileSchema>
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Phone Number')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Not specified')}
                      {...field}
                      disabled={!isEditing}
                      className={cn(
                        'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                        isEditing
                          ? form.formState.errors.phone
                            ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                            : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                          : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Preferred Language')}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          'w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer data-[placeholder]:text-muted-foreground/70',
                          isEditing
                            ? 'bg-card border-primary ring-2 ring-primary/5'
                            : 'bg-muted-light/50 [&>span]:opacity-100',
                        )}
                      >
                        <SelectValue placeholder={t('Select Language')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English (English)</SelectItem>
                      <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                      <SelectItem value="gu">Gujarati (ગુજરાતી)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Date of Birth')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ''}
                      disabled={!isEditing}
                      className={cn(
                        'w-full h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                        'relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100',
                        isEditing
                          ? form.formState.errors.dob
                            ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                            : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                          : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />
          </>
        )}

        {/* ─── Rental Address Fields ─── */}
        {(viewSection === 'all' || viewSection === 'address') && (
          <>
            {viewSection === 'all' && (
              <div className="col-span-full border-t border-border/30 pt-6 mt-4">
                <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-primary" />
                  {t('Rental Address')}
                </h4>
                <p className="text-[11px] text-muted-foreground/85 font-medium mb-4">
                  {t('Rental Address Subtitle')}
                </p>
              </div>
            )}

            <FormField<ProfileSchema>
              control={form.control}
              name="addressType"
              render={({ field }) => (
                <FormItem className="col-span-full rounded-2xl border border-border/40 bg-muted/20 p-4 mb-1">
                  <FormLabel className="text-[12px] font-bold text-foreground mb-2.5 block">
                    {t('Address Type')}
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => field.onChange('home')}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${field.value === 'home'
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
                      onClick={() => field.onChange('shop')}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${field.value === 'shop'
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                        } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <Building2 className="h-4 w-4" strokeWidth={2} />
                      {t('Shop Address')}
                    </button>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="shopName"
              render={({ field }) => (
                <FormItem className="space-y-1.5 col-span-full">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {addressType === 'shop'
                      ? t('Shop Name')
                      : t('Shop / Home Name (Optional)')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      {addressType === 'shop' ? (
                        <Store className="h-4 w-4 text-muted-foreground/60" />
                      ) : (
                        <Home className="h-4 w-4 text-muted-foreground/60" />
                      )}
                    </div>
                    <FormControl>
                      <Input
                        placeholder={
                          addressType === 'shop'
                            ? t('e.g. Raju Camera Store')
                            : t("e.g. Ramesh's Home")
                        }
                        {...field}
                        disabled={!isEditing}
                        className={cn(
                          'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                          isEditing
                            ? form.formState.errors.shopName
                              ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                              : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                            : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem className="space-y-1.5 col-span-full">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Address Line 1')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Home className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('House No., Building Name, Suite')}
                        {...field}
                        disabled={!isEditing}
                        className={cn(
                          'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                          isEditing
                            ? form.formState.errors.addressLine1
                              ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                              : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                            : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem className="space-y-1.5 col-span-full">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Address Line 2 (Optional)')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Building2 className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('Floor, Apartment, Phase (Optional)')}
                        {...field}
                        disabled={!isEditing}
                        className={cn(
                          'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                          isEditing
                            ? 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                            : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="space-y-1.5 col-span-full">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Street / Area')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Map className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('Street name, landmark, locality')}
                        {...field}
                        disabled={!isEditing}
                        className={cn(
                          'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                          isEditing
                            ? form.formState.errors.street
                              ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                              : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                            : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="googleMapLink"
              render={({ field }) => (
                <FormItem className="space-y-1.5 col-span-full">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold text-muted-foreground/70">
                      {t('Google Map Link (Optional)')}
                    </FormLabel>
                    <a
                      href="https://www.youtube.com/results?search_query=how+to+get+google+map+link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      {t('How to get Google Maps Link?')}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <MapPin className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t('Paste your Google Maps link here')}
                        {...field}
                        disabled={!isEditing}
                        className={cn(
                          'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                          isEditing
                            ? form.formState.errors.googleMapLink
                              ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                              : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                            : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('Pincode')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Hash className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <FormControl>
                      <Input
                        maxLength={6}
                        placeholder={t('e.g. 395001')}
                        {...field}
                        disabled={!isEditing}
                        className={cn(
                          'h-11 pl-10 pr-9 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                          isEditing
                            ? form.formState.errors.pincode
                              ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                              : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                            : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                        )}
                      />
                    </FormControl>
                    {isPincodeLoading && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('City')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <MapPin className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <FormControl>
                      <LocationCombobox
                        type="city"
                        value={field.value || ''}
                        parentId={stateId}
                        onChange={(val) => field.onChange(val)}
                        placeholder={t('Search city...')}
                        disabled={!isEditing || !stateId}
                        className={cn(
                          'h-11 pl-10',
                          form.formState.errors.city &&
                          'border-destructive ring-2 ring-destructive/10',
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />

            <FormField<ProfileSchema>
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    {t('State')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <MapPin className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <FormControl>
                      <LocationCombobox
                        type="state"
                        value={field.value || ''}
                        parentId={countryId}
                        onChange={(val, id) => {
                          field.onChange(val)
                          setStateId(id)
                          form.setValue('city', '', { shouldValidate: true })
                        }}
                        placeholder={t('Search state...')}
                        disabled={!isEditing}
                        className={cn(
                          'h-11 pl-10',
                          form.formState.errors.state &&
                          'border-destructive ring-2 ring-destructive/10',
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[11px] font-bold mt-1" />
                </FormItem>
              )}
            />
          </>
        )}
      </div>

      {isEditing && (
        <div className="mt-8 flex items-center gap-3 justify-end border-t border-border/30 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleEditClick}
            disabled={isSaving}
            className="rounded-xl font-bold h-11 px-6 shadow-none"
          >
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl font-bold h-11 px-8 shadow-md"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Save Changes')}
          </Button>
        </div>
      )}
    </div>
  )
}
