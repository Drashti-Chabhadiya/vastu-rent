import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
import { SettingsSectionShell, Row } from './SettingsSectionShell'
import { useTranslation } from '#/context/TranslationContext'

interface NotificationsSectionProps {
  emailN: boolean
  smsN: boolean
  mktN: boolean
  pushN: boolean
  handleTogglePreference: (
    key: 'email' | 'sms' | 'marketing' | 'push',
    val: boolean,
  ) => void
}

export function NotificationsSection({
  emailN,
  smsN,
  mktN,
  pushN,
  handleTogglePreference,
}: NotificationsSectionProps) {
  const { t } = useTranslation()
  return (
    <SettingsSectionShell
      title={t("Notifications")}
      description={t("Choose how and when you want to be notified.")}
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        <Row
          label={t("Email Notifications")}
          desc={t("Booking updates, approvals and receipts.")}
        >
          <Switch
            checked={emailN}
            onCheckedChange={(v) => handleTogglePreference('email', v)}
          />
        </Row>
        <Row
          label={t("SMS Notifications")}
          desc={t("Text messages for bookings and payments.")}
        >
          <Switch
            checked={smsN}
            onCheckedChange={(v) => handleTogglePreference('sms', v)}
          />
        </Row>
        <Row
          label={t("Marketing Emails")}
          desc={t("Offers, promotions and new features.")}
        >
          <Switch
            checked={mktN}
            onCheckedChange={(v) => handleTogglePreference('marketing', v)}
          />
        </Row>
        <Row
          label={t("Push Notifications")}
          desc={t("Real-time alerts on your device.")}
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
