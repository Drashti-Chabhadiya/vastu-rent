import { addressSchema } from '#/schema'
import type { AddressSchema } from '#/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import {
  MapPin,
  Home,
  Building2,
  Map,
  Navigation,
  Hash,
  Globe,
  CheckCircle2,
  ArrowRight,
  Store,
  Loader2,
} from 'lucide-react'
import { apiClient } from '#/lib/api'
import { useTranslation } from '#/context/TranslationContext'
import { toast } from 'sonner'
import { LocationCombobox } from '@/components/ui/location-combobox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function AddressSetupPage() {
  const { t } = useTranslation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [addressType, setAddressType] = useState<'home' | 'shop'>('home')

  const [countryId, setCountryId] = useState<number | undefined>(101) // Default India (ID: 101)
  const [stateId, setStateId] = useState<number | undefined>()
  const [isPincodeLoading, setIsPincodeLoading] = useState(false)

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema) as any,
    mode: 'onChange',
    defaultValues: {
      addressType: 'home',
      shopName: '',
      addressLine1: '',
      addressLine2: '',
      street: '',
      city: '',
      pincode: '',
      state: '',
      country: 'India',
    } as any,
  })
  const { formState: { isSubmitting } } = form

  const pincodeValue = form.watch('pincode')

  useEffect(() => {
    if (pincodeValue && pincodeValue.length === 6 && /^[1-9][0-9]{5}$/.test(pincodeValue)) {
      let isSubscribed = true
      setIsPincodeLoading(true)

      apiClient.get(`/locations/pincode/${pincodeValue}`)
        .then(async (res) => {
          if (!isSubscribed) return
          const data = res.data
          if (data?.valid) {
            form.clearErrors('pincode')
            if (data.state) {
              form.setValue('state', data.state, { shouldValidate: true })
              try {
                const stateRes = await apiClient.get(`/locations/states/search?q=${encodeURIComponent(data.state)}&countryId=${countryId || 101}`)
                if (stateRes.data && stateRes.data.length > 0) {
                  const matchedState = stateRes.data.find(
                    (s: any) => s.name.toLowerCase() === data.state.toLowerCase()
                  ) || stateRes.data[0]
                  setStateId(matchedState.id)
                }
              } catch (e) {
                // ignore state lookup error
              }
            }
            if (data.district) {
              form.setValue('city', data.district, { shouldValidate: true })
            }
            toast.success(`Pincode verified: ${data.district}, ${data.state}`)
          }
        })
        .catch((err) => {
          if (!isSubscribed) return
          const errMsg = err?.response?.data?.message || 'Invalid 6-digit Pincode'
          form.setError('pincode', { type: 'manual', message: errMsg })
        })
        .finally(() => {
          if (isSubscribed) setIsPincodeLoading(false)
        })

      return () => {
        isSubscribed = false
      }
    }
  }, [pincodeValue, countryId, form])

  const handleAddressTypeChange = (type: 'home' | 'shop') => {
    if (type === addressType) return
    setAddressType(type)
    form.setValue('addressType', type, { shouldValidate: true })
  }

  const onSubmit = async (values: AddressSchema) => {
    setServerError(null)
    try {
      await apiClient.patch('/users/settings', {
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || '',
        street: values.street,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        country: values.country,
        shopName: values.shopName || '',
      })

      setSuccess(true)

      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        'Failed to save address. Please try again.'
      setServerError(errMsg)
      toast.error(errMsg)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5 border border-emerald-100">
            <CheckCircle2
              className="w-10 h-10 text-emerald-500"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Address Saved!
          </h2>
          <p className="text-[14px] text-muted-foreground font-medium">
            Redirecting you to the home page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-400">
          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[12px] font-bold mb-4 border border-primary/20">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />
              One Last Step
            </div>
            <h1 className="text-[28px] sm:text-[32px] font-extrabold text-foreground tracking-tight leading-tight">
              {t('Rental Address Title')}
            </h1>
            <p className="mt-2 text-[14px] text-muted-foreground/85 font-semibold leading-relaxed text-primary">
              {t('Rental Address Subtitle')}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {['Account Created', 'Email Verified', 'Add Address'].map(
              (step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0
                      ${i < 2 ? 'bg-primary text-primary-foreground' : 'bg-primary-soft border-2 border-primary text-primary'}
                    `}
                    >
                      {i < 2 ? '✓' : '3'}
                    </div>
                    <span
                      className={`text-[10px] font-semibold text-center leading-tight hidden sm:block
                      ${i === 2 ? 'text-primary' : 'text-muted-foreground'}
                    `}
                    >
                      {step}
                    </span>
                  </div>
                  {i < 2 && <div className="h-0.5 bg-primary w-full mb-4" />}
                </div>
              ),
            )}
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl border border-border/30 shadow-sm p-6 sm:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (formErrors) => {
                  const firstError = Object.values(formErrors)[0]?.message
                  toast.error(
                    typeof firstError === 'string'
                      ? firstError
                      : 'Please check all required address fields.',
                  )
                })}
              >
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border/40 bg-muted/20 p-4">
                    <p className="text-[13px] font-bold text-foreground mb-3">
                      Please indicate whether the address you're setting up for your
                      listing is your home address or your shop address.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddressTypeChange('home')}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${addressType === 'home'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                          }`}
                      >
                        <Home className="h-4 w-4" strokeWidth={2} />
                        Home Address
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddressTypeChange('shop')}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${addressType === 'shop'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                          }`}
                      >
                        <Building2 className="h-4 w-4" strokeWidth={2} />
                        Shop Address
                      </button>
                    </div>
                  </div>

                  {/* Hidden addressType field */}
                  <input type="hidden" {...form.register('addressType')} />

                  {/* Shop Name */}
                  <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                          {addressType === 'shop' ? (
                            <>
                              Shop Name <span className="text-destructive">*</span>
                            </>
                          ) : (
                            <>
                              Shop / Home Name{' '}
                              <span className="text-muted-foreground/50 font-normal text-[11px]">
                                (Optional)
                              </span>
                            </>
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              {addressType === 'shop' ? (
                                <Store
                                  className="h-[17px] w-[17px] text-muted-foreground/60"
                                  strokeWidth={2}
                                />
                              ) : (
                                <Home
                                  className="h-[17px] w-[17px] text-muted-foreground/60"
                                  strokeWidth={2}
                                />
                              )}
                            </div>
                            <Input
                              placeholder={
                                addressType === 'shop'
                                  ? 'e.g. Raju Camera Store'
                                  : "e.g. Ramesh's Home"
                              }
                              className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              {...field}
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Line 1 */}
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                          Address Line 1 <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <Home
                                className="h-[17px] w-[17px] text-muted-foreground/60"
                                strokeWidth={2}
                              />
                            </div>
                            <Input
                              placeholder="House/Flat No., Building Name"
                              className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Line 2 */}
                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                          Address Line 2{' '}
                          <span className="text-muted-foreground/50 font-normal text-[11px]">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <Building2
                                className="h-[17px] w-[17px] text-muted-foreground/60"
                                strokeWidth={2}
                              />
                            </div>
                            <Input
                              placeholder="Apartment, Suite, Floor (optional)"
                              className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              {...field}
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Street / Area */}
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                          Street / Area <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <Map
                                className="h-[17px] w-[17px] text-muted-foreground/60"
                                strokeWidth={2}
                              />
                            </div>
                            <Input
                              placeholder="Street name, locality, area"
                              className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City & Pincode — 2 columns */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                            City <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                <Navigation
                                  className="h-[16px] w-[16px] text-muted-foreground/60"
                                  strokeWidth={2}
                                />
                              </div>
                              <LocationCombobox
                                type="city"
                                value={field.value}
                                parentId={stateId}
                                onChange={(val) => {
                                  form.setValue('city', val, { shouldValidate: true })
                                }}
                                placeholder="Search city..."
                                disabled={!stateId}
                                className="pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                            Pincode <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                <Hash
                                  className="h-[16px] w-[16px] text-muted-foreground/60"
                                  strokeWidth={2}
                                />
                              </div>
                              <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="e.g. 395001"
                                className="w-full h-12 pl-10 pr-9 rounded-xl border border-border bg-background text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all relative z-0"
                                {...field}
                              />
                              {isPincodeLoading && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* State */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                          State <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <MapPin
                                className="h-[17px] w-[17px] text-muted-foreground/60"
                                strokeWidth={2}
                              />
                            </div>
                            <LocationCombobox
                              type="state"
                              value={field.value}
                              parentId={countryId}
                              onChange={(val, id) => {
                                form.setValue('state', val, { shouldValidate: true })
                                setStateId(id)
                                form.setValue('city', '', { shouldValidate: true })
                              }}
                              placeholder="Search state..."
                              disabled={!countryId}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-bold text-foreground mb-1.5">
                          Country <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <Globe
                                className="h-[17px] w-[17px] text-muted-foreground/60"
                                strokeWidth={2}
                              />
                            </div>
                            <LocationCombobox
                              type="country"
                              value={field.value}
                              onChange={(val, id) => {
                                form.setValue('country', val, { shouldValidate: true })
                                setCountryId(id)
                                setStateId(undefined)
                                form.setValue('state', '', { shouldValidate: true })
                                form.setValue('city', '', { shouldValidate: true })
                              }}
                              placeholder="Search country..."
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {serverError && (
                    <p className="text-center text-sm text-destructive font-medium bg-danger px-3 py-2 rounded-xl">
                      {serverError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-white rounded-full animate-spin" />
                        Saving Address...
                      </>
                    ) : (
                      <>
                        Save & Continue
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-[11px] text-muted-foreground/70 font-medium leading-relaxed">
                    🔒 Your address is stored securely and only used for rental
                    transactions and nearby search.
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
