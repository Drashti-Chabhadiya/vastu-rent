import { useState, useEffect } from 'react'
import { Switch } from '#/components/ui/switch'
import { registerDeviceForPush } from '#/lib/fcm'
import { toast } from 'sonner'
import { BellRing } from 'lucide-react'

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
  const [pushEnabled, setPushEnabled] = useState(false)
  const [hasPermissionSupport, setHasPermissionSupport] = useState(false)

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
        {/* Secure User-Initiated Web Push Opt-in card */}
        {hasPermissionSupport && (
          <div className="flex items-center justify-between p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-300 shadow-sm">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-black text-foreground/90 flex items-center gap-1.5">
                <BellRing
                  size={14}
                  className="text-emerald-600 animate-bounce"
                />
                Browser Push Notifications
              </h4>
              <p className="text-[10px] font-semibold text-muted-dark leading-normal">
                Receive instant real-time updates for bookings, payments, and
                messaging directly on this device.
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
              className="data-[state=checked]:bg-emerald-600 shrink-0"
            />
          </div>
        )}

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
