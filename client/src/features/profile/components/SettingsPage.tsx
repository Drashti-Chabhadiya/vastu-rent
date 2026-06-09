import { useState, useRef } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { apiClient } from '#/lib/api'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import {
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  Lock,
  Link2,
  Trash2,
} from 'lucide-react'
import { SecurityDialogs } from './SecurityDialogs'

import { ProfileInfoSection } from './settings/ProfileInfoSection'
import { AccountSecuritySection } from './settings/AccountSecuritySection'
import { NotificationsSection } from './settings/NotificationsSection'
import { PaymentMethodsSection } from './settings/PaymentMethodsSection'
import { PrivacySection } from './settings/PrivacySection'
import { ConnectedAccountsSection } from './settings/ConnectedAccountsSection'
import { DeleteAccountSection } from './settings/DeleteAccountSection'
import { useProfileData } from '#/hook'

const subNavItems = [
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'security', label: 'Account & Security', icon: ShieldCheck },
  { id: 'notifs', label: 'Notifications', icon: Bell },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'connected', label: 'Connected Accounts', icon: Link2 },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
]

export function SettingsPage() {
  const [section, setSection] = useState('profile')

  const {
    name, setName,
    phone, setPhone,
    location, setLocation,
    bio, setBio,
    imagePreview: imgPreview, setImagePreview: setImgPreview,
    pwOpen, setPwOpen,
    tfaOpen, setTfaOpen,
    sessOpen, setSessOpen,
    devOpen, setDevOpen,
    twoFactorEnabled: tfaEnabled,
    emailNotifications: emailN,
    smsNotifications: smsN,
    marketingEmails: mktN,
    pushNotifications: pushN,
    session,
    refetch,
    busy,
    uploadImage: uploadImg,
    updateSettings: saveSettings,
    handleTogglePreference,
    handleToggleTwoFactor,
  } = useProfileData()

  const fileRef = useRef<HTMLInputElement>(null)

  // privacy
  const [showProf, setShowProf] = useState(true)
  const [showOnline, setShowOnline] = useState(true)
  const [allowData, setAllowData] = useState(true)

  // delete
  const [delInput, setDelInput] = useState('')
  const [delLoading, setDelLoading] = useState(false)

  if (!session?.user) return null
  const user = session.user as any
  const avatar = imgPreview || user.image || null
  const initials = (user.name || 'U').charAt(0).toUpperCase()

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      if (name.trim() && name.trim() !== user.name) {
        await authClient.updateUser({ name: name.trim() })
      }
      if (fileRef.current?.files?.[0]) {
        await uploadImg(fileRef.current.files[0])
      }
      await saveSettings({ phone, location, bio })
      await refetch()
      setImgPreview(null)
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile.')
    }
  }

  const handleTogglePrivacy = async (
    key: 'prof' | 'online' | 'data',
    val: boolean,
  ) => {
    if (key === 'prof') setShowProf(val)
    if (key === 'online') setShowOnline(val)
    if (key === 'data') setAllowData(val)
    toast.success('Privacy setting updated.')
  }

  const handleDeleteAccount = async () => {
    if (delInput !== 'DELETE') {
      toast.error('Type DELETE to confirm.')
      return
    }
    setDelLoading(true)
    try {
      await apiClient.post('/users/settings/delete-request')
      toast.success(
        'Account deletion request submitted. Our team will process it within 48 hours.',
      )
      setDelInput('')
    } catch {
      toast.error(
        'Failed to submit deletion request. Please contact support@vastu.com.',
      )
    } finally {
      setDelLoading(false)
    }
  }

  return (
    <div className="font-sans">
      {/* Page header */}
      <div className={cn('mb-5', 'px-1')}>
        <h1
          className={cn(
            'text-2xl',
            'font-extrabold',
            'text-foreground',
            'tracking-tight',
            'leading-none',
          )}
        >
          Settings
        </h1>
        <p
          className={cn(
            'text-[13px]',
            'text-muted-foreground/85',
            'mt-2',
            'font-medium',
          )}
        >
          Manage your account preferences and security.
        </p>
      </div>

      {/* Card */}
      <div
        className={cn(
          'flex',
          'flex-col',
          'lg:flex-row',
          'bg-card',
          'rounded-2xl',
          'border',
          'border-border/30',
          'shadow-sm',
          'overflow-hidden',
          'min-h-[600px]',
        )}
      >
        {/* ── Left sub-nav ── */}
        <nav
          className={cn(
            'w-full',
            'lg:w-[210px]',
            'shrink-0',
            'border-b',
            'lg:border-b-0',
            'lg:border-r',
            'border-border/30',
            'py-2',
            'lg:py-3',
            'flex',
            'flex-row',
            'lg:flex-col',
            'overflow-x-auto',
            'lg:overflow-x-visible',
            'scrollbar-hide',
          )}
        >
          {subNavItems.map(({ id, label, icon: Icon }) => {
            const active = section === id
            const isDel = id === 'delete'
            return (
              <Button
                key={id}
                variant="ghost"
                onClick={() => setSection(id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 lg:px-5 lg:py-3 text-[13px] font-semibold text-left w-auto lg:w-full shrink-0 cursor-pointer transition-colors border-b-2 border-l-0 lg:border-b-0 lg:border-l-2 rounded-none justify-start h-auto',
                  active &&
                  !isDel &&
                  'text-primary bg-primary-soft/70 border-primary hover:bg-primary-soft/70 hover:text-primary',
                  active &&
                  isDel &&
                  'text-destructive bg-danger/60 border-destructive/40 hover:bg-danger/60 hover:text-destructive',
                  !active &&
                  !isDel &&
                  'text-muted-foreground/85 hover:text-foreground/90 hover:bg-muted-light border-transparent',
                  !active &&
                  isDel &&
                  'text-destructive/80 hover:text-destructive hover:bg-danger border-transparent',
                )}
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </Button>
            )
          })}
        </nav>

        {/* ── Right content ── */}
        <div
          className={cn(
            'flex-1',
            'min-w-0',
            'p-4',
            'sm:p-8',
            'overflow-y-auto',
          )}
        >
          {/* ── PROFILE INFORMATION ── */}
          {section === 'profile' && (
            <ProfileInfoSection
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              location={location}
              setLocation={setLocation}
              bio={bio}
              setBio={setBio}
              avatar={avatar}
              initials={initials}
              busy={busy}
              fileRef={fileRef}
              handleSaveProfile={handleSaveProfile}
              setImgPreview={setImgPreview}
              userEmail={user.email}
            />
          )}

          {/* ── ACCOUNT & SECURITY ── */}
          {section === 'security' && (
            <AccountSecuritySection
              tfaEnabled={tfaEnabled}
              setPwOpen={setPwOpen}
              setTfaOpen={setTfaOpen}
              setSessOpen={setSessOpen}
              setDevOpen={setDevOpen}
              handleToggleTwoFactor={handleToggleTwoFactor}
            />
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifs' && (
            <NotificationsSection
              emailN={emailN}
              smsN={smsN}
              mktN={mktN}
              pushN={pushN}
              handleTogglePreference={handleTogglePreference}
            />
          )}

          {/* ── PAYMENT METHODS ── */}
          {section === 'payment' && <PaymentMethodsSection />}

          {/* ── PRIVACY ── */}
          {section === 'privacy' && (
            <PrivacySection
              showProf={showProf}
              showOnline={showOnline}
              allowData={allowData}
              handleTogglePrivacy={handleTogglePrivacy}
            />
          )}

          {/* ── CONNECTED ACCOUNTS ── */}
          {section === 'connected' && <ConnectedAccountsSection />}

          {/* ── DELETE ACCOUNT ── */}
          {section === 'delete' && (
            <DeleteAccountSection
              delInput={delInput}
              setDelInput={setDelInput}
              delLoading={delLoading}
              handleDeleteAccount={handleDeleteAccount}
            />
          )}
        </div>
        {/* end right content */}
      </div>
      {/* end card */}

      {/* ── Dialogs ── */}
      <SecurityDialogs
        pwOpen={pwOpen}
        setPwOpen={setPwOpen}
        tfaOpen={tfaOpen}
        setTfaOpen={setTfaOpen}
        sessOpen={sessOpen}
        setSessOpen={setSessOpen}
        devOpen={devOpen}
        setDevOpen={setDevOpen}
        twoFactorEnabled={tfaEnabled}
        handleToggleTwoFactor={handleToggleTwoFactor}
        userEmail={user.email}
      />
    </div>
  )
}
