import { ChevronRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
import { SettingsSectionShell, Row } from './SettingsSectionShell'

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
  return (
    <SettingsSectionShell
      title="Account & Security"
      description="Manage your password and keep your account secure."
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        <Row label="Password" desc="••••••••••••••••">
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
            Change Password <ChevronRight size={14} />
          </Button>
        </Row>
        <Row
          label="Two-Factor Authentication"
          desc="Add an extra layer of security to your account."
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
          label="Login Sessions"
          desc="View and manage your active sessions."
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
            View Sessions <ChevronRight size={14} />
          </Button>
        </Row>
        <Row
          label="Trusted Devices"
          desc="Manage devices that can access your account."
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
            View Devices <ChevronRight size={14} />
          </Button>
        </Row>
      </div>
    </SettingsSectionShell>
  )
}
