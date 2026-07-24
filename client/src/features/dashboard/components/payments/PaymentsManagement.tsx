import { useState } from 'react'
import {
  ChevronRight,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Lock,
  Zap,
  XCircle,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { format } from 'date-fns'
import {
  usePayoutDashboard,
  useCreatePayoutRequest,
  useAllPayoutRequests,
  useUpdatePayoutStatus,
} from '#/hook'
import { authClient } from '#/lib/auth/auth-client'
import { PaymentsManagementSkeleton } from '#/components/skeletons'
import { toast } from 'sonner'
import { useTranslation } from '#/context/TranslationContext'

// Import extracted sub-components
import { EarningStatsCards } from './components/EarningStatsCards'
import { WithdrawalRequestModal } from './components/WithdrawalRequestModal'
import { AdminPayoutApprovals } from './components/AdminPayoutApprovals'
import { RevenueTransactionsTable } from './components/RevenueTransactionsTable'
import { ProductEarningsBreakdown } from './components/ProductEarningsBreakdown'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

export const PaymentsManagement = () => {
  const { t, formatDate, formatNumber, formatCurrency } = useTranslation()
  const { data: session } = authClient.useSession()
  const role = session?.user.role || 'user'
  const isAdmin = role === 'admin'
  const [currentView, setCurrentView] = useState<'my' | 'all'>('my')

  // Fetch queries
  const { data: dashboardData, isLoading: isDashboardLoading } =
    usePayoutDashboard()
  const { data: allAdminPayoutsData, isLoading: isAdminPayoutsLoading } =
    useAllPayoutRequests({ enabled: isAdmin })

  const allAdminPayouts = allAdminPayoutsData?.payouts || []
  const platformStats = allAdminPayoutsData?.platformStats || {
    totalGmv: 0,
    totalBookings: 0,
    totalPayoutsPaid: 0,
    totalPayoutsPending: 0,
  }

  // Mutations
  const createPayout = useCreatePayoutRequest()
  const updatePayoutStatus = useUpdatePayoutStatus()

  // Dialog state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)

  const handleRequestPayout = (amt: number, onSuccess: () => void) => {
    createPayout.mutate(amt, {
      onSuccess: () => {
        toast.success('Payout request successfully submitted! 🎉')
        setIsPayoutModalOpen(false)
        onSuccess()
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            'Failed to submit payout request',
        )
      },
    })
  }

  const handleAdminAction = (
    payoutId: string,
    actionType: 'approved' | 'rejected' | 'paid',
    notes: string,
    onSuccess: () => void,
  ) => {
    updatePayoutStatus.mutate(
      {
        id: payoutId,
        status: actionType,
        notes: notes,
      },
      {
        onSuccess: () => {
          toast.success(`Payout successfully updated to ${actionType}!`)
          onSuccess()
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              'Failed to update payout request',
          )
        },
      },
    )
  }

  if (isDashboardLoading || (isAdmin && isAdminPayoutsLoading)) {
    return <PaymentsManagementSkeleton />
  }

  const stats = dashboardData?.stats || {
    totalEarnings: 0,
    monthlyEarnings: 0,
    platformCommission: 0,
    netEarnings: 0,
    withdrawableBalance: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
  }

  const payoutRequests = dashboardData?.payoutRequests || []
  const productBreakdown = dashboardData?.productBreakdown || []
  const recentTransactions = dashboardData?.recentTransactions || []

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <CheckCircle2 size={10} /> {t('Paid')}
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-indigo-50 text-indigo-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <Zap size={10} /> {t('Approved')}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-danger text-destructive border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <XCircle size={10} /> {t('Rejected')}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-warning text-warning-foreground border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <Clock size={10} /> {t('Pending')}
          </Badge>
        )
    }
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Breadcrumbs / Page Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-dark uppercase tracking-widest">
            <span>{t('Dashboard')}</span>
            <ChevronRight size={10} className="text-muted-dark" />
            <span className="text-emerald-600 font-extrabold">
              {t('Earnings & Financial Payouts')}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground/90 flex items-center gap-2">
            <IndianRupee className="text-emerald-600" size={26} />
            {t('Earnings & Financial Payouts')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
          {isAdmin ? (
            <div className="flex items-center gap-2 rounded-full bg-dash-bg-soft p-1 shrink-0">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('my')}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all h-auto cursor-pointer ${
                  currentView === 'my'
                    ? 'bg-dash-brand text-primary-foreground hover:bg-dash-brand hover:text-primary-foreground'
                    : 'text-dash-text-soft hover:text-dash-text hover:bg-transparent'
                }`}
              >
                {t('My Payouts')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentView('all')}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all h-auto cursor-pointer ${
                  currentView === 'all'
                    ? 'bg-dash-brand text-primary-foreground hover:bg-dash-brand hover:text-primary-foreground'
                    : 'text-dash-text-soft hover:text-dash-text hover:bg-transparent'
                }`}
              >
                {t('All Platform Payouts')}
              </Button>
            </div>
          ) : null}

          {/* Date Month Selector */}
          <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border/30 shadow-sm">
            <Calendar size={14} className="text-emerald-600" />
            <span className="text-xs font-black text-muted-foreground tracking-wider">
              {formatDate(new Date(), { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* CORE EARNINGS / PLATFORM ANALYTICS CARDS */}
      {currentView === 'my' ? (
        <motion.div variants={fadeUp}>
          <EarningStatsCards stats={stats} />
        </motion.div>
      ) : (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1: Platform GMV */}
          <div className="bg-card p-6 rounded-3xl border border-border/30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
                {t('Platform GMV')}
              </span>
              <h3 className="text-xl font-black text-foreground/90">
                {formatCurrency(platformStats.totalGmv)}
              </h3>
              <span className="text-[9px] font-bold text-muted-dark block">
                {t('Total booking volume')}
              </span>
            </div>
          </div>
          {/* Card 2: Platform Bookings */}
          <div className="bg-card p-6 rounded-3xl border border-border/30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-warning text-warning-foreground shrink-0">
              <ShoppingCart size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
                {t('Platform Bookings')}
              </span>
              <h3 className="text-xl font-black text-foreground/90">
                {formatNumber(platformStats.totalBookings)}
              </h3>
              <span className="text-[9px] font-bold text-muted-dark block">
                {t('Total bookings processed')}
              </span>
            </div>
          </div>
          {/* Card 3: Payouts Processed */}
          <div className="bg-card p-6 rounded-3xl border border-border/30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 shrink-0">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
                {t('Paid Out Volume')}
              </span>
              <h3 className="text-xl font-black text-foreground/90">
                {formatCurrency(platformStats.totalPayoutsPaid)}
              </h3>
              <span className="text-[9px] font-bold text-muted-dark block text-indigo-500">
                {t('Successfully settled')}
              </span>
            </div>
          </div>
          {/* Card 4: Pending Payouts Queue */}
          <div className="bg-card p-6 rounded-3xl border border-border/30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-600 shrink-0">
              <Clock size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
                {t('Pending Queue')}
              </span>
              <h3 className="text-xl font-black text-foreground/90">
                {formatCurrency(platformStats.totalPayoutsPending)}
              </h3>
              <span className="text-[9px] font-bold text-muted-dark block text-orange-500">
                {t('Awaiting approvals')}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Render based on selected toggle tab */}
      {currentView === 'my' ? (
        <>
          {/* WITHDRAWABLE BALANCE HEADER & TRIGGER BUTTON */}
          <motion.div
            variants={fadeUp}
            className="bg-foreground p-8 rounded-[2.5rem] text-primary-foreground flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 text-primary-foreground">
              <Zap size={250} strokeWidth={1} />
            </div>
            <div className="space-y-2 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-emerald-500/20 px-2 py-0.5 rounded">
                {t('Settlement Wallet')}
              </span>
              <h3 className="text-sm font-semibold text-muted-dark">
                {t('Available Withdrawable Balance')}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">
                  {formatCurrency(stats.withdrawableBalance)}
                </span>
                <span className="text-[10px] text-muted-dark font-bold">
                  {t('Net Earnings - Pending payouts')}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                if (stats.withdrawableBalance <= 0) {
                  toast.error(
                    t('You do not have any withdrawable balance currently'),
                  )
                  return
                }
                setIsPayoutModalOpen(true)
              }}
              className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground h-14 px-8 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dash-brand/20 transition-all active:scale-95 z-10 self-start md:self-auto cursor-pointer"
            >
              <Plus size={16} /> {t('Request Withdrawal')}
            </Button>
          </motion.div>

          {/* CORE PAYMENT TRANSACTIONS & SUMMARY GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
            {/* Left Column: Recent Transactions & Product Breakdown */}
            <div className="lg:col-span-2 space-y-8">
              {/* Payment History & Transactions */}
              <motion.div variants={fadeUp}>
                <RevenueTransactionsTable
                  recentTransactions={recentTransactions}
                />
              </motion.div>

              {/* Earnings Breakdown by Product */}
              <motion.div variants={fadeUp}>
                <ProductEarningsBreakdown productBreakdown={productBreakdown} />
              </motion.div>
            </div>

            {/* Right Column: Payout History Requests */}
            <div className="space-y-8">
              {/* Payout Requests History list */}
              <motion.div
                variants={fadeUp}
                className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-[15px] font-black text-foreground/90">
                    {t('Payout Settlement History')}
                  </h3>
                  <p className="text-[11px] font-bold text-muted-dark mt-0.5">
                    {t('Track your payout withdrawal request updates.')}
                  </p>
                </div>

                <div className="space-y-4">
                  {payoutRequests.length === 0 ? (
                    <div className="text-center py-10 bg-muted-light rounded-2xl border border-border/30 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-dark">
                        <Clock size={16} />
                      </div>
                      <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                        {t('No payout requests placed')}
                      </span>
                    </div>
                  ) : (
                    payoutRequests.map((req: any) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl border border-border/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-foreground/90">
                            ₹{req.amount.toLocaleString()}
                          </span>
                          <div>{getPayoutStatusBadge(req.status)}</div>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold text-muted-dark">
                          <span>
                            {format(
                              new Date(req.createdAt),
                              'dd MMM yyyy, hh:mm a',
                            )}
                          </span>
                          {req.notes && (
                            <span
                              className="text-destructive max-w-[150px] truncate"
                              title={req.notes}
                            >
                              Notes: {req.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Secure details safety card */}
              <motion.div
                variants={fadeUp}
                className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-4"
              >
                <h3 className="text-[15px] font-black text-foreground/90 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  {t('Safety Settlement Guarantee')}
                </h3>
                <p className="text-[11px] font-semibold text-muted-foreground/85 leading-relaxed">
                  {t(
                    'Platform settlements are fully paid out with 0% commission fees. Payout requests are verified by auditing dispute histories and cleared within 24-48 hours.',
                  )}
                </p>
                <div className="border-t border-border/30 pt-4 flex items-center gap-2 text-[10px] font-black text-muted-dark uppercase tracking-widest">
                  <Lock size={12} className="text-emerald-600" />{' '}
                  {t('BANK-LEVEL SSL ENCRYPTED')}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
          <div className="lg:col-span-2 space-y-8">
            {/* ADMIN PENDING ACTIONS PORTAL (Admin only) */}
            <motion.div variants={fadeUp}>
              <AdminPayoutApprovals
                allAdminPayouts={allAdminPayouts || []}
                onAdminAction={handleAdminAction}
                isUpdating={updatePayoutStatus.isPending}
              />
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* All Users Payout Requests History list */}
            <motion.div
              variants={fadeUp}
              className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-[15px] font-black text-foreground/90">
                  {t('All Platform Payout History')}
                </h3>
                <p className="text-[11px] font-bold text-muted-dark mt-0.5">
                  {t('Track payout requests from all users on the platform.')}
                </p>
              </div>

              <div className="space-y-4">
                {allAdminPayouts?.length === 0 ? (
                  <div className="text-center py-10 bg-muted-light rounded-2xl border border-border/30 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-dark">
                      <Clock size={16} />
                    </div>
                    <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                      {t('No payout requests placed')}
                    </span>
                  </div>
                ) : (
                  allAdminPayouts?.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-border/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-foreground/90 block">
                            ₹{req.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                            {t('By')} {req.user?.name || t('User')}
                          </span>
                        </div>
                        <div>{getPayoutStatusBadge(req.status)}</div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold text-muted-dark">
                        <span>
                          {format(
                            new Date(req.createdAt),
                            'dd MMM yyyy, hh:mm a',
                          )}
                        </span>
                        {req.notes && (
                          <span
                            className="text-destructive max-w-[150px] truncate"
                            title={req.notes}
                          >
                            Notes: {req.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* WITHDRAWAL REQUEST FORM MODAL POPUP */}
      <WithdrawalRequestModal
        isOpen={isPayoutModalOpen}
        onOpenChange={setIsPayoutModalOpen}
        withdrawableBalance={stats.withdrawableBalance}
        session={session}
        onRequestSubmit={handleRequestPayout}
        isPending={createPayout.isPending}
      />
    </motion.div>
  )
}
