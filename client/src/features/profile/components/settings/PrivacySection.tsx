import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
import { SettingsSectionShell, Row } from './SettingsSectionShell'

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
  return (
    <SettingsSectionShell
      title="Privacy"
      description="Control your data and privacy settings."
    >
      <div className={cn('divide-y', 'divide-border/30')}>
        <Row
          label="Show profile to other users"
          desc="Let renters and hosts see your public profile."
        >
          <Switch
            checked={showProf}
            onCheckedChange={(v) => handleTogglePrivacy('prof', v)}
          />
        </Row>
        <Row
          label="Show online status"
          desc="Let others see when you are active."
        >
          <Switch
            checked={showOnline}
            onCheckedChange={(v) => handleTogglePrivacy('online', v)}
          />
        </Row>
        <Row
          label="Allow data for personalisation"
          desc="Help us improve your recommendations."
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
