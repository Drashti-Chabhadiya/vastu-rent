import { useState, useEffect } from 'react'
import { Switch } from '#/components/ui/switch'
import { registerDeviceForPush } from '#/lib/fcm'
import { toast } from 'sonner'
import { BellRing, Save } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface NotificationSettingsFormProps {
  bookingAlerts: boolean
  settlementAlerts: boolean
  marketingAlerts: boolean
  handleNotificationSave: (
    booking: boolean,
    settlement: boolean,
    marketing: boolean,
  ) => void
  isSaving: boolean
}

export const NotificationSettingsForm = ({
  bookingAlerts,
  settlementAlerts,
  marketingAlerts,
  handleNotificationSave,
  isSaving,
}: NotificationSettingsFormProps) => {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [hasPermissionSupport, setHasPermissionSupport] = useState(false)

  // Local switch states for buffering
  const [localBookingAlerts, setLocalBookingAlerts] = useState(bookingAlerts)
  const [localSettlementAlerts, setLocalSettlementAlerts] =
    useState(settlementAlerts)
  const [localMarketingAlerts, setLocalMarketingAlerts] =
    useState(marketingAlerts)

  // Synchronize local states when baseline props change from database
  useEffect(() => {
    setLocalBookingAlerts(bookingAlerts)
    setLocalSettlementAlerts(settlementAlerts)
    setLocalMarketingAlerts(marketingAlerts)
  }, [bookingAlerts, settlementAlerts, marketingAlerts])

  // Initialize current browser permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPermissionSupport(true)
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [])

  // User-initiated toggle to grant notification permissions securely on click
  const handlePushToggle = async (val: boolean) => {
    if (!val) {
      toast.info(
        'To completely block push notifications, click the lock/settings icon in your browser address bar and reset notification permissions.',
      )
      setPushEnabled(false)
      return
    }

    const toastId = toast.loading(
      'Requesting browser notification permissions...',
    )
    try {
      const token = await registerDeviceForPush()
      if (token) {
        setPushEnabled(true)
        toast.success('Browser push notifications successfully enabled! 🔔', {
          id: toastId,
        })
      } else {
        setPushEnabled(false)
        toast.error(
          'Failed to enable push notifications. Please ensure you select "Allow" when prompted.',
          { id: toastId },
        )
      }
    } catch (err) {
      setPushEnabled(false)
      toast.error('Could not request notification permissions.', {
        id: toastId,
      })
    }
  }

  const hasChanges =
    localBookingAlerts !== bookingAlerts ||
    localSettlementAlerts !== settlementAlerts ||
    localMarketingAlerts !== marketingAlerts

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNotificationSave(
      localBookingAlerts,
      localSettlementAlerts,
      localMarketingAlerts,
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 animate-in fade-in duration-300"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/10">
        <div>
          <h3 className="text-xl font-extrabold text-dash-brand font-display tracking-tight leading-none">
            Notification Preferences
          </h3>
          <p className="text-[12px] font-semibold text-muted-dark mt-2">
            Control when and how you receive alerts.
          </p>
        </div>
        <Button
          type="submit"
          disabled={!hasChanges || isSaving}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground rounded-[12px] px-6 h-11 text-xs font-black flex items-center gap-2 shadow-md shadow-dash-brand/10 cursor-pointer transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dash-brand"
        >
          <Save size={13} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Secure User-Initiated Web Push Opt-in card */}
        {hasPermissionSupport && (
          <div className="flex items-center justify-between p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-300 shadow-sm">
            <div className="space-y-1 pr-4">
              <h4 className="text-sm font-bold text-brand-primary-deep flex items-center gap-1.5">
                <BellRing
                  size={14}
                  className="text-emerald-600 animate-bounce"
                />
                Browser Push Notifications
              </h4>
              <p className="text-[11px] font-semibold text-brand-primary-deep/90 leading-normal">
                Receive instant real-time updates for bookings, payments, and
                messaging directly on this device.
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
              className="data-[state=checked]:bg-brand-primary-deep cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center justify-between p-4.5 rounded-2xl border border-border bg-muted-light/30 hover:bg-muted-light/80 transition-all duration-200">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-800">
              New Booking Alerts
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-normal">
              Receive alert when renter requests a product booking.
            </p>
          </div>
          <Switch
            checked={localBookingAlerts}
            onCheckedChange={setLocalBookingAlerts}
            className="data-[state=checked]:bg-dash-brand cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4.5 rounded-2xl border border-border bg-muted-light/30 hover:bg-muted-light/80 transition-all duration-200">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-800">
              Payout Settlements
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-normal">
              Get notified when money settles to your bank.
            </p>
          </div>
          <Switch
            checked={localSettlementAlerts}
            onCheckedChange={setLocalSettlementAlerts}
            className="data-[state=checked]:bg-dash-brand cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4.5 rounded-2xl border border-border bg-muted-light/30 hover:bg-muted-light/80 transition-all duration-200">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-800">
              Marketing Updates
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-normal">
              Receive monthly platform optimization guides.
            </p>
          </div>
          <Switch
            checked={localMarketingAlerts}
            onCheckedChange={setLocalMarketingAlerts}
            className="data-[state=checked]:bg-dash-brand cursor-pointer"
          />
        </div>
      </div>
    </form>
  )
}
