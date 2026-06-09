import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
import { SettingsSectionShell, Row } from './SettingsSectionShell'

interface NotificationsSectionProps {
  emailN: boolean
  smsN: boolean
  mktN: boolean
  pushN: boolean
  handleTogglePreference: (key: 'email' | 'sms' | 'marketing' | 'push', val: boolean) => void
}

export function NotificationsSection({
  emailN,
  smsN,
  mktN,
  pushN,
  handleTogglePreference,
}: NotificationsSectionProps) {
  return (
    <SettingsSectionShell
      title="Notifications"
      description="Choose how and when you want to be notified."
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        <Row
          label="Email Notifications"
          desc="Booking updates, approvals and receipts."
        >
          <Switch
            checked={emailN}
            onCheckedChange={(v) => handleTogglePreference('email', v)}
          />
        </Row>
        <Row
          label="SMS Notifications"
          desc="Text messages for bookings and payments."
        >
          <Switch
            checked={smsN}
            onCheckedChange={(v) => handleTogglePreference('sms', v)}
          />
        </Row>
        <Row
          label="Marketing Emails"
          desc="Offers, promotions and new features."
        >
          <Switch
            checked={mktN}
            onCheckedChange={(v) => handleTogglePreference('marketing', v)}
          />
        </Row>
        <Row
          label="Push Notifications"
          desc="Real-time alerts on your device."
          last
        >
          <Switch
            checked={pushN}
            onCheckedChange={(v) => handleTogglePreference('push', v)}
          />
        </Row>
      </div>
    </SettingsSectionShell>
  )
}
