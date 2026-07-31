import { useState, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { useTranslation } from '#/context/TranslationContext'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { SettingsPageSkeleton } from '#/components/skeletons'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import {
  Bell,
  CreditCard,
  Lock,
  Link2,
  Trash2,
  Palette,
  ChevronRight,
  LogOut,
  User,
  HelpCircle,
  FileText,
  Globe,
} from 'lucide-react'
import { SecurityDialogs } from './SecurityDialogs'
// import { ProfileInfoSection } from './settings/ProfileInfoSection'
// import { AccountSecuritySection } from './settings/AccountSecuritySection'
import { NotificationsSection } from './settings/NotificationsSection'
import { PaymentMethodsSection } from './settings/PaymentMethodsSection'
import { PrivacySection } from './settings/PrivacySection'
import { ConnectedAccountsSection } from './settings/ConnectedAccountsSection'
import { DeleteAccountSection } from './settings/DeleteAccountSection'
import { ThemeSection } from './settings/ThemeSection'
import { useProfileData, useDeleteAccountRequest } from '#/hook'
import { MobileBackHeader } from '#/components/common/MobileBackHeader'

const subNavItems = [
  // { id: 'profile', label: 'Profile Information', icon: User },
  // { id: 'security', label: 'Account & Security', icon: ShieldCheck },
  { id: 'theme', label: 'Theme & Appearance', icon: Palette },
  { id: 'notifs', label: 'Notifications', icon: Bell },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'connected', label: 'Connected Accounts', icon: Link2 },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
]

export function SettingsPage() {
  const { t } = useTranslation()
  const [section, setSection] = useState('home')
  const [localLogoutOpen, setLocalLogoutOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Sync desktop vs mobile defaults
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (!isMobile && section === 'home') {
      setSection('theme')
    }
  }, [section])

  const deleteAccountRequest = useDeleteAccountRequest()

  const {
    // name,
    // setName,
    // phone,
    // setPhone,
    // location,
    // setLocation,
    // bio,
    // setBio,
    // imagePreview: imgPreview,
    // setImagePreview: setImgPreview,
    pwOpen,
    setPwOpen,
    tfaOpen,
    setTfaOpen,
    sessOpen,
    setSessOpen,
    devOpen,
    setDevOpen,
    twoFactorEnabled: tfaEnabled,
    emailNotifications: emailN,
    smsNotifications: smsN,
    marketingEmails: mktN,
    pushNotifications: pushN,
    session,
    // refetch,
    // busy,
    // uploadImage: uploadImg,
    // updateSettings: saveSettings,
    handleTogglePreference,
    handleToggleTwoFactor,
    showProfile,
    showOnline,
    allowData,
    handleTogglePrivacy,
    isPending: isProfileLoading,
  } = useProfileData()

  // const fileRef = useRef<HTMLInputElement>(null)

  // delete
  const [delInput, setDelInput] = useState('')
  const [delLoading, setDelLoading] = useState(false)

  if (isProfileLoading || !session?.user) {
    return <SettingsPageSkeleton />
  }
  const user = session.user as any
  // const avatar = imgPreview || user.image || null
  // const initials = (user.name || 'U').charAt(0).toUpperCase()

  // ── handlers ────────────────────────────────────────────────────────────────
  // const handleSaveProfile = async () => {
  //   try {
  //     if (name.trim() && name.trim() !== user.name) {
  //       await authClient.updateUser({ name: name.trim() })
  //     }
  //     if (fileRef.current?.files?.[0]) {
  //       await uploadImg(fileRef.current.files[0])
  //     }
  //     await saveSettings({ phone, location, bio })
  //     await refetch()
  //     setImgPreview(null)
  //     toast.success(t('Profile saved!'))
  //   } catch {
  //     toast.error(t('Failed to save profile.'))
  //   }
  // }

  const handleDeleteAccount = async () => {
    if (delInput !== 'DELETE') {
      toast.error(t('Type DELETE to confirm.'))
      return
    }
    setDelLoading(true)
    try {
      await deleteAccountRequest.mutateAsync()
      toast.success(
        t(
          'Account deletion request submitted. Our team will process it within 48 hours.',
        ),
      )
      setDelInput('')
    } catch {
      toast.error(
        t(
          'Failed to submit deletion request. Please contact support@vastu.com.',
        ),
      )
    } finally {
      setDelLoading(false)
    }
  }

  const handleLocalLogout = async () => {
    setLogoutLoading(true)
    try {
      await authClient.signOut()
      window.location.href = '/'
    } catch {
      toast.error(t('Failed to log out.'))
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <div className="font-sans">
      {/* ── MOBILE SETTINGS VIEW (Screen 17 mockup style) ── */}
      <div className="block lg:hidden select-none pb-8">
        {section === 'home' ? (
          <div className="space-y-6">
            <div className="md:hidden px-1 pt-2">
              <MobileBackHeader title={t('Settings')} />
            </div>

            {/* ACCOUNT SECTION */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-1">
                {t('Account')}
              </span>
              <div className="bg-white dark:bg-card border border-border/15 rounded-[20px] p-1 divide-y divide-border/10 shadow-3xs">
                <Link
                  to="/account"
                  className="flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all rounded-t-[18px]"
                >
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Edit profile')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>

                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Language')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted-dark pr-1">
                    {t('English')}
                  </span>
                </div>
              </div>
            </div>

            {/* SETTINGS SECTIONS */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-1">
                {t('Preferences')}
              </span>
              <div className="bg-white dark:bg-card border border-border/15 rounded-[20px] p-1 divide-y divide-border/10 shadow-3xs">
                {/* Theme & Appearance */}
                <button
                  type="button"
                  onClick={() => setSection('theme')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all text-left bg-transparent border-none cursor-pointer rounded-t-[18px]"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Theme & Appearance')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  onClick={() => setSection('notifs')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all text-left bg-transparent border-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Notifications')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>

                {/* Payment Methods */}
                <button
                  type="button"
                  onClick={() => setSection('payment')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all text-left bg-transparent border-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Payment Methods')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>

                {/* Privacy */}
                <button
                  type="button"
                  onClick={() => setSection('privacy')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all text-left bg-transparent border-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Privacy')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>

                {/* Connected Accounts */}
                <button
                  type="button"
                  onClick={() => setSection('connected')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all text-left bg-transparent border-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Link2 size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Connected Accounts')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>

                {/* Delete Account */}
                <button
                  type="button"
                  onClick={() => setSection('delete')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all text-left bg-transparent border-none cursor-pointer rounded-b-[18px]"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={16} className="text-destructive/80" />
                    <span className="text-[12.5px] font-semibold text-destructive">
                      {t('Delete Account')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* SUPPORT SECTION */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-1">
                {t('Support')}
              </span>
              <div className="bg-white dark:bg-card border border-border/15 rounded-[20px] p-1 divide-y divide-border/10 shadow-3xs">
                <Link
                  to="/help"
                  className="flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all rounded-t-[18px]"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Help center')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>

                <Link
                  to="/terms"
                  className="flex items-center justify-between p-3.5 hover:bg-muted-light/20 transition-all rounded-b-[18px]"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted-foreground" />
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {t('Terms of service')}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* LOG OUT BUTTON */}
            <div className="pt-2 px-1">
              <Button
                onClick={() => setLocalLogoutOpen(true)}
                className="w-full h-12 bg-white dark:bg-card border border-destructive/30 text-destructive hover:bg-destructive/10 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
              >
                <LogOut size={16} />
                {t('Log out')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            <div className="w-full">
              {section === 'theme' && <ThemeSection />}
              {section === 'notifs' && (
                <NotificationsSection
                  emailN={emailN}
                  smsN={smsN}
                  mktN={mktN}
                  pushN={pushN}
                  handleTogglePreference={handleTogglePreference}
                />
              )}
              {section === 'payment' && <PaymentMethodsSection />}
              {section === 'privacy' && (
                <PrivacySection
                  showProf={showProfile}
                  showOnline={showOnline}
                  allowData={allowData}
                  handleTogglePrivacy={handleTogglePrivacy}
                />
              )}
              {section === 'connected' && <ConnectedAccountsSection />}
              {section === 'delete' && (
                <DeleteAccountSection
                  delInput={delInput}
                  setDelInput={setDelInput}
                  delLoading={delLoading}
                  handleDeleteAccount={handleDeleteAccount}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP SETTINGS VIEW ── */}
      <div className="hidden lg:block">
        {/* Page header */}
        <div className={cn('mb-5', 'px-1')}>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
            Settings
          </h1>
          <p className="text-[13px] text-muted-foreground/85 mt-2 font-medium">
            {t('Manage your account preferences and security.')}
          </p>
        </div>

        {/* Card */}
        <div className="flex flex-col lg:flex-row bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden min-h-[600px]">
          {/* Left sub-nav */}
          <nav className="w-full lg:w-[210px] shrink-0 border-b lg:border-b-0 lg:border-r border-border/30 py-2 lg:py-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-hide">
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
                  {t(label)}
                </Button>
              )
            })}
          </nav>

          {/* Right content */}
          <div className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
            {section === 'theme' && <ThemeSection />}
            {section === 'notifs' && (
              <NotificationsSection
                emailN={emailN}
                smsN={smsN}
                mktN={mktN}
                pushN={pushN}
                handleTogglePreference={handleTogglePreference}
              />
            )}
            {section === 'payment' && <PaymentMethodsSection />}
            {section === 'privacy' && (
              <PrivacySection
                showProf={showProfile}
                showOnline={showOnline}
                allowData={allowData}
                handleTogglePrivacy={handleTogglePrivacy}
              />
            )}
            {section === 'connected' && <ConnectedAccountsSection />}
            {section === 'delete' && (
              <DeleteAccountSection
                delInput={delInput}
                setDelInput={setDelInput}
                delLoading={delLoading}
                handleDeleteAccount={handleDeleteAccount}
              />
            )}
          </div>
        </div>
      </div>

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

      {/* Local Logout Confirmation Dialog */}
      {localLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setLocalLogoutOpen(false)}
          />
          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-xs p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center mb-4 text-destructive">
              <LogOut size={22} />
            </div>
            <h2 className="text-base font-extrabold text-foreground mb-1">
              {t('Log out')}
            </h2>
            <p className="text-[11px] text-muted-foreground/80 leading-normal mb-5">
              {t('Are you sure you want to log out?')}
            </p>
            <Button
              onClick={handleLocalLogout}
              disabled={logoutLoading}
              className="w-full h-10 bg-destructive hover:bg-destructive-hover text-white text-xs font-black rounded-xl mb-2 flex items-center justify-center cursor-pointer border-none shadow-sm shadow-danger/25"
            >
              {logoutLoading ? t('Logging out...') : t('Log out')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocalLogoutOpen(false)}
              disabled={logoutLoading}
              className="w-full h-10 rounded-xl border border-border bg-transparent text-xs font-bold text-muted-dark cursor-pointer"
            >
              {t('Cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
