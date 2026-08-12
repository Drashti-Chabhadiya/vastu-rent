import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ProfileSchema } from '#/schema'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'
import { usePincodeLookup, useStateSearch } from '#/hook'
import { toast } from 'sonner'
import { Pencil, Loader2, ArrowRight } from 'lucide-react'
import { PersonalInfoSection } from './PersonalInfoSection'
import { AddressSection } from './AddressSection'

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
  const stateVal = form.watch('state')

  const lastVerifiedPincode = useRef<string | null>(pincode)
  const [countryId] = useState<number | undefined>(101)
  const [stateId, setStateId] = useState<number | undefined>()

  const isValidPincodeFormat = Boolean(
    pincode && pincode.length === 6 && /^[1-9][0-9]{5}$/.test(pincode),
  )
  const { data: pincodeData, isLoading: isPincodeLoading } = usePincodeLookup(
    pincode,
    { enabled: isEditing && isValidPincodeFormat },
  )
  const { data: matchedStates } = useStateSearch(
    pincodeData?.state || stateVal,
    countryId,
    { enabled: Boolean(pincodeData?.state || stateVal) },
  )

  useEffect(() => {
    if (!isEditing) lastVerifiedPincode.current = pincode
  }, [isEditing, pincode])

  useEffect(() => {
    if (
      isEditing &&
      pincodeData?.valid &&
      pincodeData.pincode !== lastVerifiedPincode.current
    ) {
      if (pincodeData.state)
        form.setValue('state', pincodeData.state, { shouldValidate: true })
      if (pincodeData.district)
        form.setValue('city', pincodeData.district, { shouldValidate: true })
      toast.success(
        `Pincode verified: ${pincodeData.district}, ${pincodeData.state}`,
      )
      lastVerifiedPincode.current = pincodeData.pincode || pincode
    }
  }, [pincodeData, isEditing, pincode, form])

  useEffect(() => {
    const currentStateName = pincodeData?.state || stateVal
    if (matchedStates && matchedStates.length > 0 && currentStateName) {
      const matched =
        matchedStates.find(
          (s: any) => s.name.toLowerCase() === currentStateName.toLowerCase(),
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {(viewSection === 'all' || viewSection === 'personal') && (
          <PersonalInfoSection
            form={form}
            email={email}
            isEditing={isEditing}
          />
        )}
        {(viewSection === 'all' || viewSection === 'address') && (
          <AddressSection
            form={form}
            isEditing={isEditing}
            viewSection={viewSection}
            stateId={stateId}
            setStateId={setStateId}
            countryId={countryId}
            isPincodeLoading={isPincodeLoading}
          />
        )}
      </div>

      {isEditing && (
        <div className="mt-8 flex items-center gap-3 justify-end border-t border-border/30 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleEditClick}
            disabled={isSaving}
            className="rounded-full font-bold h-11 px-6 bg-muted text-muted-foreground hover:bg-muted-dark/20 transition-all border-none"
          >
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="group bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-8 rounded-full active:scale-[0.98] shadow-md transition-all inline-flex items-center justify-center gap-2 border-none"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t('Save Changes')}
            {!isSaving && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                <ArrowRight size={14} strokeWidth={3} />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
