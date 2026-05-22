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
        <h3 className="text-[16px] font-black text-slate-800">
          Notification Preferences
        </h3>
        <p className="text-[11px] font-bold text-slate-400">
          Control when and how you receive alerts.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/20">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800">
              New Booking Alerts
            </h4>
            <p className="text-[10px] font-semibold text-slate-400">
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

        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/20">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800">
              Payout Settlements
            </h4>
            <p className="text-[10px] font-semibold text-slate-400">
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

        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/20">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800">
              Marketing Updates
            </h4>
            <p className="text-[10px] font-semibold text-slate-400">
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
