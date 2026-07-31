import type { UseFormReturn } from 'react-hook-form'
import type { ProfileSchema } from '#/schema'
import { Input } from '#/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import { cn } from '#/lib/utils'
import { LocationCombobox } from '@/components/ui/location-combobox'
import { useTranslation } from '#/context/TranslationContext'
import {
  MapPin,
  Home,
  Building2,
  Store,
  Map,
  Hash,
  Loader2,
  ExternalLink,
} from 'lucide-react'

interface Props {
  form: UseFormReturn<ProfileSchema>
  isEditing: boolean
  viewSection: 'all' | 'personal' | 'address'
  stateId: number | undefined
  setStateId: (id: number | undefined) => void
  countryId: number | undefined
  isPincodeLoading: boolean
}

export function AddressSection({
  form,
  isEditing,
  viewSection,
  stateId,
  setStateId,
  countryId,
  isPincodeLoading,
}: Props) {
  const { t } = useTranslation()
  const errors = form.formState.errors
  const addressType = form.watch('addressType')

  return (
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

      <FormField
        control={form.control}
        name="addressType"
        render={({ field }) => (
          <FormItem className="col-span-full rounded-2xl border border-border/40 bg-muted/20 p-4 mb-1">
            <FormLabel className="text-[12px] font-bold text-foreground mb-2.5 block">
              {t('Address Type')}
            </FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {(['home', 'shop'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={!isEditing}
                  onClick={() => field.onChange(type)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer',
                    field.value === type
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40',
                    !isEditing && 'opacity-70 cursor-not-allowed',
                  )}
                >
                  {type === 'home' ? (
                    <Home className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Building2 className="h-4 w-4" strokeWidth={2} />
                  )}
                  {type === 'home' ? t('Home Address') : t('Shop Address')}
                </button>
              ))}
            </div>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />

      <FormField
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
                      ? errors.shopName
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

      <FormField
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
                      ? errors.addressLine1
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

      <FormField
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

      <FormField
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
                      ? errors.street
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

      <FormField
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
                  value={field.value || ''}
                  disabled={!isEditing}
                  className={cn(
                    'h-11 pl-10 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                    isEditing
                      ? errors.googleMapLink
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

      <FormField
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
                      ? errors.pincode
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

      <FormField
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
                    errors.city &&
                      'border-destructive ring-2 ring-destructive/10',
                  )}
                />
              </FormControl>
            </div>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />

      <FormField
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
                    errors.state &&
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
  )
}
