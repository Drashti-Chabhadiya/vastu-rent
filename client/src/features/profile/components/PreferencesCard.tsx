import { Switch } from '#/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useTranslation } from '#/context/TranslationContext'

interface PreferencesCardProps {
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  currency: string
  handleTogglePreference: (key: 'email' | 'sms' | 'marketing' | 'push', checked: boolean) => Promise<void>
  handleCurrencyChange: (newCurrency: string) => Promise<void>
}

export function PreferencesCard({
  emailNotifications,
  smsNotifications,
  marketingEmails,
  currency,
  handleTogglePreference,
  handleCurrencyChange,
}: PreferencesCardProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-card rounded-[32px] border border-border/30 shadow-sm p-8">
      <h3 className="font-extrabold text-foreground text-base font-display">
        {t('Preferences')}
      </h3>
      <p className="text-xs text-muted-foreground/85 mt-1 font-medium leading-none">
        {t('Customize your experience on Vastu.')}
      </p>

      <div className="mt-6 space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {t('Email Notifications')}
            </span>
            <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
              {t('Stay updated with important updates')}
            </span>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={(checked) =>
              handleTogglePreference('email', checked)
            }
          />
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {t('SMS Notifications')}
            </span>
            <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
              {t('Receive text messages for bookings')}
            </span>
          </div>
          <Switch
            checked={smsNotifications}
            onCheckedChange={(checked) =>
              handleTogglePreference('sms', checked)
            }
          />
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {t('Marketing Emails')}
            </span>
            <span className="text-xs text-muted-foreground/70 font-medium mt-0.5">
              {t('Receive offers and promotions')}
            </span>
          </div>
          <Switch
            checked={marketingEmails}
            onCheckedChange={(checked) =>
              handleTogglePreference('marketing', checked)
            }
          />
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-bold text-foreground">
            {t('Currency')}
          </span>
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-28 h-9 px-3 rounded-xl border border-border text-xs font-semibold text-foreground bg-card focus:outline-none cursor-pointer shadow-none">
              <SelectValue placeholder={t('Select Currency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
