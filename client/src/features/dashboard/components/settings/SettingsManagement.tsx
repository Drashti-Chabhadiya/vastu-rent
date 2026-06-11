import { useState, useEffect } from 'react'
import {
  ChevronRight,
  Calendar,
  User,
  Bell,
  CreditCard,
  ShieldCheck,
  Settings,
  Lock,
  Cpu,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { authClient } from '#/lib/auth/auth-client'
import { useUpdateUserSettings } from '#/hook'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

// Import extracted sub-components
import { UserProfileSettingsCard } from '#/features/profile'
import { PayoutSettingsForm } from './components/PayoutSettingsForm'
import { NotificationSettingsForm } from './components/NotificationSettingsForm'
import { SiteSettingsForm } from './components/SiteSettingsForm'
import { usePayoutSettingsStore } from '../../../../store/usePayoutSettingsStore'

export const SettingsManagement = () => {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const activeUser = session?.user

  // Active Tab State
  const [activeSubTab, setActiveSubTab] = useState('profile')

  // Payout Settings Store Actions
  const initializePayout = usePayoutSettingsStore((state) => state.initialize)

  // Notification Preferences States
  const [bookingAlerts, setBookingAlerts] = useState(true)
  const [settlementAlerts, setSettlementAlerts] = useState(true)
  const [marketingAlerts, setMarketingAlerts] = useState(false)

  const updateSettings = useUpdateUserSettings()

  // Load user session details dynamically
  useEffect(() => {
    if (activeUser) {
      initializePayout(activeUser)
      setBookingAlerts((activeUser as any).bookingAlerts !== false)
      setSettlementAlerts((activeUser as any).settlementAlerts !== false)
      setMarketingAlerts((activeUser as any).marketingAlerts === true)
    }
  }, [activeUser, initializePayout])

  // Handle Bank Account Save via API Mutation
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault()
    const state = usePayoutSettingsStore.getState()
    updateSettings.mutate(
      {
        bankName: state.bankName,
        accountNumber: state.accountNumber,
        ifscCode: state.ifscCode,
        upiId: state.upiId,
        accountHolder: state.accountHolder,
      },
      {
        onSuccess: () => {
          toast.success(
            'Payout Bank details successfully saved in Database! 🏦',
          )
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              'Failed to save bank details',
          )
        },
      },
    )
  }

  // Handle Notifications Save via API Mutation
  const handleSaveNotifications = (
    bookingAlertsVal: boolean,
    settlementAlertsVal: boolean,
    marketingAlertsVal: boolean,
  ) => {
    updateSettings.mutate(
      {
        bookingAlerts: bookingAlertsVal,
        settlementAlerts: settlementAlertsVal,
        marketingAlerts: marketingAlertsVal,
      },
      {
        onSuccess: () => {
          setBookingAlerts(bookingAlertsVal)
          setSettlementAlerts(settlementAlertsVal)
          setMarketingAlerts(marketingAlertsVal)
          toast.success(
            'Notification preferences successfully saved in Database! 🔔',
          )
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              'Failed to update notification settings',
          )
        },
      },
    )
  }

  if (isSessionLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 bg-muted/40 rounded-md w-32" />
          <div className="h-6 bg-muted/80 rounded-lg w-48" />
        </div>
        <div className="h-[400px] bg-card border border-border/30 rounded-[2rem] shadow-sm" />
      </div>
    )
  }

  const isAdmin = activeUser?.role === 'admin'

  const sidebarItems = [
    {
      id: 'profile',
      label: 'Profile Settings',
      desc: 'Update your profile information',
      icon: User,
    },
    {
      id: 'payment',
      label: 'Payout Settings',
      desc: 'Configure bank and settlement methods',
      icon: CreditCard,
    },
    {
      id: 'notifications',
      label: 'Notification Preferences',
      desc: 'Control your alert preferences',
      icon: Bell,
    },
    ...(isAdmin
      ? [
          {
            id: 'site-content',
            label: 'Site Content Settings',
            desc: 'Customize contact, pricing, trust, and terms',
            icon: Settings,
          },
        ]
      : []),
    {
      id: 'security',
      label: 'Security & Access',
      desc: 'Manage password and access',
      icon: Lock,
    },
    {
      id: 'api-integrations',
      label: 'API & Integrations',
      desc: 'Manage third-party integrations',
      icon: Cpu,
    },
  ]

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Breadcrumbs */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-muted-foreground/60" />
          <span className="text-dash-brand font-bold">Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-foreground/90 tracking-tight">
            Settings
          </h1>
          <div className="flex items-center gap-2 bg-card px-3.5 py-1.5 rounded-full border border-border/30 shadow-sm">
            <Calendar size={14} className="text-dash-brand" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar: Settings Navigation */}
        <div className="bg-card p-6 rounded-[2.5rem] border border-border/30 shadow-sm space-y-1.5 xl:sticky xl:top-24">
          <h2 className="text-[10px] font-extrabold tracking-widest text-muted-foreground/50 mb-3 px-3 uppercase">
            Settings Menu
          </h2>
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveSubTab(item.id)}
              className={`w-full flex items-center justify-start gap-3.5 p-3.5 h-auto rounded-2xl transition-all text-left group cursor-pointer active:scale-[0.98] ${
                activeSubTab === item.id
                  ? 'bg-[#e6f4ea] text-[#0a5c36] hover:bg-[#e6f4ea] hover:text-[#0a5c36]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
                  activeSubTab === item.id
                    ? 'bg-white text-[#0a5c36] border-emerald-100 shadow-sm'
                    : 'bg-slate-100 border-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'
                }`}
              >
                <item.icon
                  size={18}
                  strokeWidth={activeSubTab === item.id ? 2.5 : 2}
                />
              </div>
              <div className="min-w-0 text-left">
                <p
                  className={`font-sans text-[13px] leading-snug font-bold ${
                    activeSubTab === item.id
                      ? 'text-[#0a5c36]'
                      : 'text-slate-800'
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`font-sans text-[10px] font-medium leading-normal mt-0.5 truncate ${
                    activeSubTab === item.id
                      ? 'text-[#0a5c36]/80'
                      : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </Button>
          ))}
        </div>

        {/* Middle Column: Dynamic Forms */}
        <div className="xl:col-span-2 space-y-6">
          {activeSubTab === 'profile' && (
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto rounded-[32px] scrollbar-thin">
              <UserProfileSettingsCard />
            </div>
          )}

          {activeSubTab === 'payment' && (
            <div className="bg-card p-10 rounded-[2.5rem] border border-border/30 shadow-sm max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
              <PayoutSettingsForm
                handleSaveBankDetails={handleSaveBankDetails}
                isSaving={updateSettings.isPending}
                activeUser={activeUser}
              />
            </div>
          )}

          {activeSubTab === 'notifications' && (
            <div className="bg-card p-10 rounded-[2.5rem] border border-border/30 shadow-sm max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
              <NotificationSettingsForm
                bookingAlerts={bookingAlerts}
                settlementAlerts={settlementAlerts}
                marketingAlerts={marketingAlerts}
                handleNotificationSave={handleSaveNotifications}
                isSaving={updateSettings.isPending}
              />
            </div>
          )}

          {activeSubTab === 'site-content' && isAdmin && (
            <div className="bg-card p-10 rounded-[2.5rem] border border-border/30 shadow-sm max-h-[calc(100vh-12rem)] flex flex-col">
              <SiteSettingsForm />
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="bg-card p-10 rounded-[2.5rem] border border-border/30 shadow-sm space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
              <h3 className="text-[16px] font-black text-foreground/90">
                Security & Access
              </h3>
              <p className="text-[11px] font-bold text-muted-dark leading-relaxed">
                Security controls, password changes, two-factor authentication,
                active login sessions, and trusted devices are managed securely
                under your main Account Settings page.
              </p>
              <Link to="/account">
                <Button className="mt-2 bg-[#0a5c36] hover:bg-[#084a2b] text-primary-foreground font-black text-[11px] px-6 h-10 rounded-full cursor-pointer shadow-sm">
                  Go to Profile Security
                </Button>
              </Link>
            </div>
          )}

          {activeSubTab === 'api-integrations' && (
            <div className="bg-card p-10 rounded-[2.5rem] border border-border/30 shadow-sm space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
              <h3 className="text-[16px] font-black text-foreground/90">
                API & Integrations
              </h3>
              <p className="text-[11px] font-bold text-muted-dark leading-relaxed">
                Configure third-party API webhooks, web services, rental
                syndication channels, and application credentials.
              </p>
              <Button
                disabled
                className="mt-2 bg-muted-light text-muted-dark font-black text-[11px] px-6 h-10 rounded-full cursor-not-allowed"
              >
                Coming Soon
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Account Summary Info */}
        <div className="space-y-6 xl:sticky xl:top-24">
          {/* Account Details summary */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
            <h3 className="text-[13px] font-black text-foreground/90 mb-6 uppercase tracking-widest">
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-dark">
                  Account Type
                </span>
                <Badge className="bg-dash-brand-light text-dash-brand border-none font-black text-[9px] px-2.5 capitalize">
                  {activeUser?.role || 'Lister'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-dark">
                  Member Since
                </span>
                <span className="text-[11px] font-black text-foreground/80">
                  {activeUser?.createdAt
                    ? format(new Date(activeUser.createdAt), 'dd MMM yyyy')
                    : '01 Jan 2026'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-dark">
                  Database ID
                </span>
                <span
                  className="text-[10px] font-black text-foreground/80 max-w-[120px] truncate"
                  title={activeUser?.id}
                >
                  {activeUser?.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-dark">
                  Email Status
                </span>
                <span className="text-[11px] font-black text-dash-brand uppercase tracking-widest">
                  {activeUser?.emailVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Secure Details Card */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-4">
            <h3 className="text-[13px] font-black text-foreground/90 flex items-center gap-2">
              <ShieldCheck size={18} className="text-dash-brand" />
              Safety Guarantee
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground/85 leading-relaxed">
              Your details are protected using industry-grade SSL encryption and
              are kept confidential.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
