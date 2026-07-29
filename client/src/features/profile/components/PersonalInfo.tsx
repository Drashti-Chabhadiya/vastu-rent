import { useState, useEffect } from 'react'
import { ChevronRight, Leaf } from 'lucide-react'
import { useMyListings, useProfileData, useVerifyCheckoutSession } from '#/hook'
import { LoadingOverlay } from '#/components/ui/loader'
import { ProfileSkeleton } from '#/components/skeletons'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { SecurityDialogs } from './SecurityDialogs'
import { useTranslation } from '#/context/TranslationContext'
import { AccountSecurityCard } from './AccountSecurityCard'
import { PreferencesCard } from './PreferencesCard'
import { SubscriptionPlanCard } from './SubscriptionPlanCard'
import { UserProfileSettingsCard } from './UserProfileSettingsCard'
import { ProfileTabBar } from './ProfileTabBar'
import type { ProfileTab } from './ProfileTabBar'
import { motion, AnimatePresence } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'

export function PersonalInfo() {
  const {
    currency,
    emailNotifications,
    smsNotifications,
    marketingEmails,
    pwOpen,
    setPwOpen,
    tfaOpen,
    setTfaOpen,
    sessOpen,
    setSessOpen,
    devOpen,
    setDevOpen,
    twoFactorEnabled,
    session,
    refetch,
    handleTogglePreference,
    handleCurrencyChange,
    handleToggleTwoFactor,
    isPending: isProfileLoading,
  } = useProfileData()

  const { t } = useTranslation()
  const [isVerifying, setIsVerifying] = useState(false)
  const { data: myListings, isLoading: isListingsLoading } = useMyListings()
  const verifyCheckoutSession = useVerifyCheckoutSession()

  const mainAddr =
    (session?.user as any)?.address || (session?.user as any)?.addresses?.[0]
  const isProfileComplete = Boolean(mainAddr?.addressLine1 && mainAddr?.city)

  const [completeProfileModalOpen, setCompleteProfileModalOpen] = useState(
    () => {
      if (isProfileComplete) return false
      return (
        typeof window !== 'undefined' &&
        (window.location.search.includes('completeProfile=true') ||
          window.location.search.includes('fromListing=true'))
      )
    },
  )

  useEffect(() => {
    if (isProfileComplete) {
      setCompleteProfileModalOpen(false)
      if (
        typeof window !== 'undefined' &&
        window.location.search.includes('completeProfile=true')
      ) {
        const newUrl = window.location.pathname + window.location.hash
        window.history.replaceState(null, '', newUrl)
      }
    }
  }, [isProfileComplete])

  // Tab management state synced with URL hash
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    const hash = window.location.hash.replace('#', '')
    if (['personal', 'address', 'security', 'subscription'].includes(hash)) {
      return hash as ProfileTab
    }
    if (
      typeof window !== 'undefined' &&
      (window.location.search.includes('completeProfile=true') ||
        window.location.search.includes('fromListing=true'))
    ) {
      return 'address'
    }
    return 'personal'
  })

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }

  // Verify Stripe Checkout session on mount/redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (sessionId) {
      const verifySession = async () => {
        setIsVerifying(true)
        const toastId = toast.loading(
          'Verifying your payment and updating your plan...',
        )
        try {
          const res = await verifyCheckoutSession.mutateAsync({
            sessionId,
          })
          if (res?.success) {
            toast.success('🎉 Plan upgraded successfully!', { id: toastId })
            await refetch()
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            )
          } else {
            toast.error('Could not verify your checkout session.', {
              id: toastId,
            })
          }
        } catch (error: any) {
          console.error('Session verification failed:', error)
          toast.error(
            error.response?.data?.message || 'Payment verification failed.',
            { id: toastId },
          )
        } finally {
          setIsVerifying(false)
        }
      }
      verifySession()
    }
  }, [refetch])

  if (isProfileLoading || isListingsLoading || !session) {
    return <ProfileSkeleton />
  }

  const usedCount = myListings?.length || 0
  const rawTier = (session?.user as any)?.subscriptionTier || 'Starter'
  const expiresAtStr = (session?.user as any)?.subscriptionExpiresAt
  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null
  const isExpired = expiresAt ? expiresAt < new Date() : false
  const activeTier = isExpired ? 'Starter' : rawTier

  let limit = 5
  let limitStr = '5'
  if (activeTier.toLowerCase() === 'pro') {
    limit = 50
    limitStr = '50'
  } else if (activeTier.toLowerCase() === 'business') {
    limit = 999999
    limitStr = 'Unlimited'
  }

  const quotaPercent = Math.min(100, (usedCount / limit) * 100)

  let barColor = 'bg-primary'
  if (quotaPercent >= 90) {
    barColor = 'bg-destructive'
  } else if (quotaPercent >= 70) {
    barColor = 'bg-amber-500'
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="font-sans"
    >
      {/* Page Title Header */}
      <motion.div variants={fadeUp} className="mb-4 p-1">
        <h1 className="text-2xl font-extrabold text-foreground font-display tracking-tight leading-none">
          {t('My Profile')}
        </h1>
        <p className="text-[13px] text-muted-foreground/85 mt-2 font-medium">
          {t('Manage your personal information and account preferences.')}
        </p>
      </motion.div>

      {/* ─── Modular Underline Tab Navigation Bar ─── */}
      <ProfileTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="relative">
        {isVerifying && (
          <LoadingOverlay
            message={t('Verifying payment...')}
            className="rounded-[32px] z-50 animate-fade-in"
          />
        )}

        <AnimatePresence mode="wait">
          {/* Tab 1: Personal Details */}
          {activeTab === 'personal' && (
            <motion.div
              key="personal-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UserProfileSettingsCard viewSection="personal" />
            </motion.div>
          )}

          {/* Tab 2: Rental Address */}
          {activeTab === 'address' && (
            <motion.div
              key="address-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UserProfileSettingsCard viewSection="address" />
            </motion.div>
          )}

          {/* Tab 3: Security & Preferences */}
          {activeTab === 'security' && (
            <motion.div
              key="security-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Card 1: Account Security */}
              <AccountSecurityCard
                twoFactorEnabled={twoFactorEnabled}
                setPwOpen={setPwOpen}
                setTfaOpen={setTfaOpen}
                setSessOpen={setSessOpen}
                setDevOpen={setDevOpen}
              />

              {/* Card 2: Preferences */}
              <PreferencesCard
                emailNotifications={emailNotifications}
                smsNotifications={smsNotifications}
                marketingEmails={marketingEmails}
                currency={currency}
                handleTogglePreference={handleTogglePreference}
                handleCurrencyChange={handleCurrencyChange}
              />
            </motion.div>
          )}

          {/* Tab 4: Subscription Plan & Impact */}
          {activeTab === 'subscription' && (
            <motion.div
              key="subscription-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <SubscriptionPlanCard
                activeTier={activeTier}
                isExpired={isExpired}
                expiresAt={expiresAt}
                usedCount={usedCount}
                limitStr={limitStr}
                quotaPercent={quotaPercent}
                barColor={barColor}
                limit={limit}
              />

              {/* Green Member Banner */}
              <div className="bg-primary-soft rounded-[32px] border border-primary-border p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-border text-primary">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-extrabold text-primary font-display">
                      {t('Green Member')}
                    </span>
                    <span className="text-xs text-muted-foreground/85 font-bold leading-none mt-1">
                      {t("You're saving the planet!")}
                    </span>
                    <span className="text-[11px] text-muted-foreground/70 font-semibold mt-1">
                      {t(
                        'Thank you for being a part of our sustainable community.',
                      )}
                    </span>
                  </div>
                </div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline shrink-0 cursor-pointer"
                >
                  <span>{t('View Impact')}</span>
                  <ChevronRight size={14} className="mt-0.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Security Modals */}
      <SecurityDialogs
        pwOpen={pwOpen}
        setPwOpen={setPwOpen}
        tfaOpen={tfaOpen}
        setTfaOpen={setTfaOpen}
        sessOpen={sessOpen}
        setSessOpen={setSessOpen}
        devOpen={devOpen}
        setDevOpen={setDevOpen}
        twoFactorEnabled={twoFactorEnabled}
        handleToggleTwoFactor={handleToggleTwoFactor}
        userEmail={session.user.email}
      />

      {/* Mandatory Profile Completion Dialog Modal */}
      <Dialog
        open={completeProfileModalOpen}
        onOpenChange={setCompleteProfileModalOpen}
      >
        <DialogContent className="max-w-md rounded-3xl p-7 text-center border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-amber-500/15 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold">
            📢
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground font-display">
            {t('Complete Your Profile First')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">
            {t(
              'Please complete your address and profile details first before creating a listing on Vastu-Rent so renters can contact you and pick up items from your location.',
            )}
          </DialogDescription>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={() => {
                setCompleteProfileModalOpen(false)
                handleTabChange('address')
              }}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl h-11 active:scale-98 transition-all cursor-pointer border-none shadow-md"
            >
              {t('Complete Profile Now')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
