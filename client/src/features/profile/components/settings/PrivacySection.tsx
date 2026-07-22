import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
import { SettingsSectionShell, Row } from './SettingsSectionShell'
import { useTranslation } from '#/context/TranslationContext'

interface PrivacySectionProps {
  showProf: boolean
  showOnline: boolean
  allowData: boolean
  handleTogglePrivacy: (key: 'prof' | 'online' | 'data', val: boolean) => void
}

export function PrivacySection({
  showProf,
  showOnline,
  allowData,
  handleTogglePrivacy,
}: PrivacySectionProps) {
  const { t } = useTranslation()
  return (
    <SettingsSectionShell
      title={t("Privacy")}
      description={t("Control your data and privacy settings.")}
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        <Row
          label={t("Show profile to other users")}
          desc={t("Let renters and hosts see your public profile.")}
        >
          <Switch
            checked={showProf}
            onCheckedChange={(v) => handleTogglePrivacy('prof', v)}
          />
        </Row>
        <Row
          label={t("Show online status")}
          desc={t("Let others see when you are active.")}
        >
          <Switch
            checked={showOnline}
            onCheckedChange={(v) => handleTogglePrivacy('online', v)}
          />
        </Row>
        <Row
          label={t("Allow data for personalisation")}
          desc={t("Help us improve your recommendations.")}
          last
        >
          <Switch
            checked={allowData}
            onCheckedChange={(v) => handleTogglePrivacy('data', v)}
          />
        </Row>
      </div>
    </SettingsSectionShell>
  )
}
