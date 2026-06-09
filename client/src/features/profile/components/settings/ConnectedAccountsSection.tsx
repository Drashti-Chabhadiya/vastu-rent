import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { SettingsSectionShell, Row } from './SettingsSectionShell'

export function ConnectedAccountsSection() {
  const accounts = [
    {
      name: 'Google',
      icon: '🔵',
      hint: 'Sign in with your Google account',
    },
    {
      name: 'Facebook',
      icon: '🔷',
      hint: 'Sign in with your Facebook account',
    },
    {
      name: 'Apple',
      icon: '⚫',
      hint: 'Sign in with your Apple ID',
    },
  ]

  return (
    <SettingsSectionShell
      title="Connected Accounts"
      description="Link your social accounts for faster sign-in."
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        {accounts.map(({ name, icon, hint }, i, arr) => {
          const linked = name === 'Google'
          return (
            <Row
              key={name}
              label={`${icon} ${name}`}
              desc={linked ? 'Connected' : hint}
              last={i === arr.length - 1}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info(
                    `${linked ? 'Disconnect' : 'Connect'} ${name} coming soon.`,
                  )
                }
                className={cn(
                  'h-8 px-4 rounded-xl text-[12px] font-semibold shadow-none cursor-pointer',
                  linked
                    ? 'border-danger/50 text-destructive hover:bg-danger'
                    : 'border-border text-muted-foreground hover:bg-muted-light',
                )}
              >
                {linked ? 'Disconnect' : 'Connect'}
              </Button>
            </Row>
          )
        })}
      </div>
    </SettingsSectionShell>
  )
}
