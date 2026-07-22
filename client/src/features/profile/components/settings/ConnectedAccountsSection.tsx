import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { SettingsSectionShell, Row } from './SettingsSectionShell'
import { useTranslation } from '#/context/TranslationContext'

export function ConnectedAccountsSection() {
  const { t } = useTranslation()
  const accounts = [
    {
      name: 'Google',
      icon: '🔵',
      hint: t('Sign in with your Google account'),
    },
    {
      name: 'Facebook',
      icon: '🔷',
      hint: t('Sign in with your Facebook account'),
    },
    {
      name: 'Apple',
      icon: '⚫',
      hint: t('Sign in with your Apple ID'),
    },
  ]

  return (
    <SettingsSectionShell
      title={t('Connected Accounts')}
      description={t('Link your social accounts for faster sign-in.')}
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        {accounts.map(({ name, icon, hint }, i, arr) => {
          const linked = name === 'Google'
          return (
            <Row
              key={name}
              label={`${icon} ${name}`}
              desc={linked ? t('Connected') : hint}
              last={i === arr.length - 1}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info(
                    `${linked ? t('Disconnect') : t('Connect')} ${name} ${t('coming soon.')}`,
                  )
                }
                className={cn(
                  'h-8 px-4 rounded-xl text-[12px] font-semibold shadow-none cursor-pointer',
                  linked
                    ? 'border-danger/50 text-destructive hover:bg-danger'
                    : 'border-border text-muted-foreground hover:bg-muted-light',
                )}
              >
                {linked ? t('Disconnect') : t('Connect')}
              </Button>
            </Row>
          )
        })}
      </div>
    </SettingsSectionShell>
  )
}
