import { AlertTriangle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Loader } from '#/components/ui/loader'
import { cn } from '#/lib/utils'
import { SettingsSectionShell } from './SettingsSectionShell'
import { useTranslation } from '#/context/TranslationContext'

interface DeleteAccountSectionProps {
  delInput: string
  setDelInput: (v: string) => void
  delLoading: boolean
  handleDeleteAccount: () => Promise<void>
}

export function DeleteAccountSection({
  delInput,
  setDelInput,
  delLoading,
  handleDeleteAccount,
}: DeleteAccountSectionProps) {
  const { t } = useTranslation()
  const items = [
    t('Your profile and personal information'),
    t('All your listings and rental history'),
    t('All bookings and payment records'),
    t('Your reviews and ratings'),
    t('All messages and conversations'),
  ]

  return (
    <SettingsSectionShell
      title={t('Delete Account')}
      description={t(
        'Permanently remove your account and all associated data.',
      )}
    >
      {/* Warning card */}
      <div
        className={cn(
          'bg-danger/60',
          'border',
          'border-danger/30',
          'rounded-xl',
          'p-5',
          'flex',
          'items-start',
          'gap-3',
        )}
      >
        <div
          className={cn(
            'w-9',
            'h-9',
            'rounded-xl',
            'bg-danger',
            'flex',
            'items-center',
            'justify-center',
            'shrink-0',
            'mt-0.5',
          )}
        >
          <AlertTriangle size={16} className="text-destructive" />
        </div>
        <div>
          <p className={cn('text-sm', 'font-bold', 'text-destructive')}>
            This action is irreversible
          </p>
          <p
            className={cn(
              'text-[12px]',
              'text-destructive',
              'font-medium',
              'mt-1',
              'leading-relaxed',
            )}
          >
            {t(
              'Deleting your account will permanently remove all your listings, bookings, reviews, messages, and personal data. This cannot be undone.',
            )}
          </p>
        </div>
      </div>

      {/* What will be deleted */}
      <div
        className={cn(
          'bg-card',
          'border',
          'border-border/30',
          'rounded-xl',
          'p-5',
          'space-y-2',
        )}
      >
        <p className={cn('text-xs', 'font-bold', 'text-foreground/80', 'mb-3')}>
          The following will be permanently deleted:
        </p>
        {items.map((item) => (
          <div
            key={item}
            className={cn(
              'flex',
              'items-center',
              'gap-2',
              'text-[12px]',
              'text-muted-foreground/85',
              'font-medium',
            )}
          >
            <div
              className={cn(
                'w-1.5',
                'h-1.5',
                'rounded-full',
                'bg-destructive/80',
                'shrink-0',
              )}
            />
            {item}
          </div>
        ))}
      </div>

      {/* Confirmation input */}
      <div className="space-y-2">
        <Label
          className={cn('text-xs', 'font-semibold', 'text-muted-foreground')}
        >
          {t('Type')}{' '}
          <span
            className={cn('font-black', 'text-destructive', 'tracking-widest')}
          >
            DELETE
          </span>{' '}
          {t('to confirm')}
        </Label>
        <Input
          value={delInput}
          onChange={(e) => setDelInput(e.target.value)}
          placeholder={t('Type DELETE here')}
          className={cn(
            'h-10',
            'rounded-xl',
            'border-border',
            'text-sm',
            'font-medium',
            'focus-visible:ring-1',
            'focus-visible:ring-red-300',
            'max-w-xs',
          )}
        />
      </div>

      <Button
        onClick={handleDeleteAccount}
        disabled={delInput !== 'DELETE' || delLoading}
        className={cn(
          'h-10',
          'px-6',
          'rounded-xl',
          'bg-destructive/90',
          'hover:bg-destructive/90',
          'text-primary-foreground',
          'text-sm',
          'font-bold',
          'cursor-pointer',
          'border-none',
          'shadow-sm',
          'flex',
          'items-center',
          'gap-2',
          'disabled:opacity-40',
          'disabled:cursor-not-allowed',
          'w-full',
          'sm:w-auto',
          'justify-center',
        )}
      >
        {delLoading && <Loader variant="white" size={14} />}
        {delLoading ? t('Deleting...') : t('Delete My Account')}
      </Button>
    </SettingsSectionShell>
  )
}
