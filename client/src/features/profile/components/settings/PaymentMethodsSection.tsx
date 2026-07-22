import { CreditCard } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { SettingsSectionShell } from './SettingsSectionShell'
import { useTranslation } from '#/context/TranslationContext'

export function PaymentMethodsSection() {
  const { t } = useTranslation()
  return (
    <SettingsSectionShell
      title={t("Payment Methods")}
      description={t("Manage your saved payment methods and billing details.")}
    >
      <div
        className={cn(
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'py-16',
          'gap-3',
          'border',
          'border-dashed',
          'border-border',
          'rounded-xl',
        )}
      >
        <div
          className={cn(
            'w-12',
            'h-12',
            'rounded-xl',
            'bg-muted-light',
            'flex',
            'items-center',
            'justify-center',
          )}
        >
          <CreditCard size={20} className="text-muted-dark" />
        </div>
        <p
          className={cn(
            'text-[12px]',
            'font-semibold',
            'text-muted-foreground/70',
          )}
        >
          No payment methods added yet.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Payment methods coming soon.')}
          className={cn(
            'h-9',
            'px-5',
            'rounded-xl',
            'border-border',
            'text-[12px]',
            'font-semibold',
            'shadow-none',
            'cursor-pointer',
          )}
        >
          {t("Add Payment Method")}
        </Button>
      </div>
    </SettingsSectionShell>
  )
}
