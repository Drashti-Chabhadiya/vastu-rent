import { ChevronRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
import { SettingsSectionShell, Row } from './SettingsSectionShell'
import { useTranslation } from '#/context/TranslationContext'

interface AccountSecuritySectionProps {
  tfaEnabled: boolean
  setPwOpen: (open: boolean) => void
  setTfaOpen: (open: boolean) => void
  setSessOpen: (open: boolean) => void
  setDevOpen: (open: boolean) => void
  handleToggleTwoFactor: (val: boolean) => void
}

export function AccountSecuritySection({
  tfaEnabled,
  setPwOpen,
  setTfaOpen,
  setSessOpen,
  setDevOpen,
  handleToggleTwoFactor,
}: AccountSecuritySectionProps) {
  const { t } = useTranslation()
  return (
    <SettingsSectionShell
      title={t('Account & Security')}
      description={t('Manage your password and keep your account secure.')}
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        <Row label={t('Password')} desc="••••••••••••••••">
          <Button
            variant="ghost"
            onClick={() => setPwOpen(true)}
            className={cn(
              'flex',
              'items-center',
              'gap-1',
              'text-[12px]',
              'font-semibold',
              'text-muted-foreground/85',
              'hover:text-foreground/90',
              'cursor-pointer',
              'bg-transparent',
              'hover:bg-transparent',
              'transition-colors',
              'h-auto',
              'p-0',
            )}
          >
            {t('Change Password')} <ChevronRight size={14} />
          </Button>
        </Row>
        <Row
          label={t('Two-Factor Authentication')}
          desc={t('Add an extra layer of security to your account.')}
        >
          <Switch
            checked={tfaEnabled}
            onCheckedChange={(val) => {
              if (val) {
                setTfaOpen(true)
              } else {
                handleToggleTwoFactor(false)
              }
            }}
          />
        </Row>
        <Row
          label={t('Login Sessions')}
          desc={t('View and manage your active sessions.')}
        >
          <Button
            variant="ghost"
            onClick={() => setSessOpen(true)}
            className={cn(
              'flex',
              'items-center',
              'gap-1',
              'text-[12px]',
              'font-semibold',
              'text-muted-foreground/85',
              'hover:text-foreground/90',
              'cursor-pointer',
              'bg-transparent',
              'hover:bg-transparent',
              'transition-colors',
              'h-auto',
              'p-0',
            )}
          >
            {t('View Sessions')} <ChevronRight size={14} />
          </Button>
        </Row>
        <Row
          label={t('Trusted Devices')}
          desc={t('Manage devices that can access your account.')}
          last
        >
          <Button
            variant="ghost"
            onClick={() => setDevOpen(true)}
            className={cn(
              'flex',
              'items-center',
              'gap-1',
              'text-[12px]',
              'font-semibold',
              'text-muted-foreground/85',
              'hover:text-foreground/90',
              'cursor-pointer',
              'bg-transparent',
              'hover:bg-transparent',
              'transition-colors',
              'h-auto',
              'p-0',
            )}
          >
            {t('View Devices')} <ChevronRight size={14} />
          </Button>
        </Row>
      </div>
    </SettingsSectionShell>
  )
}
