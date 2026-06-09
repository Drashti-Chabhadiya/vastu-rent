import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'

interface AccountSecurityCardProps {
  twoFactorEnabled: boolean
  setPwOpen: (open: boolean) => void
  setTfaOpen: (open: boolean) => void
  setSessOpen: (open: boolean) => void
  setDevOpen: (open: boolean) => void
}

export function AccountSecurityCard({
  twoFactorEnabled,
  setPwOpen,
  setTfaOpen,
  setSessOpen,
  setDevOpen,
}: AccountSecurityCardProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8">
      <h3 className="font-extrabold text-foreground text-base font-display">
        {t('Account Security')}
      </h3>
      <p className="text-xs text-muted-foreground/85 mt-1 font-medium leading-none">
        {t('Manage your password and account security settings.')}
      </p>

      <div className="mt-6 space-y-4">
        {/* Password */}
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {t('Password')}
            </span>
            <span className="text-xs text-muted-foreground/70 font-semibold mt-0.5 tracking-wider">
              ••••••••••••
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPwOpen(true)}
            className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
          >
            {t('Change')}
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {t('Two-Factor Authentication')}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1.5 leading-none border transition-colors',
                twoFactorEnabled
                  ? 'text-primary bg-primary-soft border-primary-border'
                  : 'text-muted-foreground/85 bg-muted/50 border-border',
              )}
            >
              {twoFactorEnabled ? t('Enabled') : t('Disabled')}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTfaOpen(true)
            }}
            className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
          >
            {t('Manage')}
          </Button>
        </div>

        {/* Login Sessions */}
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {t('Login Sessions')}
            </span>
            <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
              {t('Manage your active sessions')}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSessOpen(true)}
            className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
          >
            {t('View')}
          </Button>
        </div>

        {/* Devices */}
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {t('Devices')}
            </span>
            <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
              {t('Manage your trusted devices')}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDevOpen(true)}
            className="h-8 rounded-lg px-4 text-xs font-bold text-foreground/80 shadow-none border-border hover:bg-muted-light cursor-pointer"
          >
            {t('View')}
          </Button>
        </div>
      </div>
    </div>
  )
}
