import { Switch } from '#/components/ui/switch'

interface NotificationSettingsFormProps {
  bookingAlerts: boolean
  settlementAlerts: boolean
  marketingAlerts: boolean
  handleNotificationToggle: (key: string, val: boolean) => void
}

export const NotificationSettingsForm = ({
  bookingAlerts,
  settlementAlerts,
  marketingAlerts,
  handleNotificationToggle,
}: NotificationSettingsFormProps) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-[16px] font-black text-foreground/90">
          Notification Preferences
        </h3>
        <p className="text-[11px] font-bold text-muted-dark">
          Control when and how you receive alerts.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/30 hover:bg-muted-light/20">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-foreground/90">
              New Booking Alerts
            </h4>
            <p className="text-[10px] font-semibold text-muted-dark">
              Receive alert when renter requests a product booking.
            </p>
          </div>
          <Switch
            checked={bookingAlerts}
            onCheckedChange={(val) =>
              handleNotificationToggle('bookingAlerts', val)
            }
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/30 hover:bg-muted-light/20">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-foreground/90">
              Payout Settlements
            </h4>
            <p className="text-[10px] font-semibold text-muted-dark">
              Get notified when money settles to your bank.
            </p>
          </div>
          <Switch
            checked={settlementAlerts}
            onCheckedChange={(val) =>
              handleNotificationToggle('settlementAlerts', val)
            }
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/30 hover:bg-muted-light/20">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-foreground/90">
              Marketing Updates
            </h4>
            <p className="text-[10px] font-semibold text-muted-dark">
              Receive monthly platform optimization guides.
            </p>
          </div>
          <Switch
            checked={marketingAlerts}
            onCheckedChange={(val) =>
              handleNotificationToggle('marketingAlerts', val)
            }
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>
      </div>
    </div>
  )
}
