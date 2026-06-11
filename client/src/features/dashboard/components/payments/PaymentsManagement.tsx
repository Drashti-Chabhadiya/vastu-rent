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

// Import extracted sub-components
import { EarningStatsCards } from './components/EarningStatsCards'
import { WithdrawalRequestModal } from './components/WithdrawalRequestModal'
import { AdminPayoutApprovals } from './components/AdminPayoutApprovals'
import { RevenueTransactionsTable } from './components/RevenueTransactionsTable'
import { ProductEarningsBreakdown } from './components/ProductEarningsBreakdown'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

export const PaymentsManagement = () => {
  const { data: session } = authClient.useSession()
  const role = session?.user.role || 'user'
  const isAdmin = role === 'admin'

  // Fetch queries
  const { data: dashboardData, isLoading: isDashboardLoading } =
    usePayoutDashboard()
  const { data: allAdminPayouts, isLoading: isAdminPayoutsLoading } =
    useAllPayoutRequests({ enabled: isAdmin })

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
            <CheckCircle2 size={10} /> Paid
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-indigo-50 text-indigo-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <Zap size={10} /> Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-danger text-destructive border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <XCircle size={10} /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-warning text-warning-foreground border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <Clock size={10} /> Pending
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
            <span>Dashboard</span>
            <ChevronRight size={10} className="text-muted-dark" />
            <span className="text-emerald-600 font-extrabold">
              Earnings & Payouts
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground/90 flex items-center gap-2">
            <IndianRupee className="text-emerald-600" size={26} />
            Earnings & Payouts
          </h2>
        </div>

        {/* Date Month Selector */}
        <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border/30 shadow-sm self-start md:self-auto">
          <Calendar size={14} className="text-emerald-600" />
          <span className="text-xs font-black text-muted-foreground tracking-wider">
            {format(new Date(), 'MMMM yyyy')}
          </span>
        </div>
      </motion.div>

      {/* CORE EARNINGS ANALYTICS CARDS */}
      <motion.div variants={fadeUp}>
        <EarningStatsCards stats={stats} />
      </motion.div>

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
            Settlement Wallet
          </span>
          <h3 className="text-sm font-semibold text-muted-dark">
            Available Withdrawable Balance
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black">
              ₹{stats.withdrawableBalance.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-dark font-bold">
              Net Earnings - Pending payouts
            </span>
          </div>
        </div>

        <Button
          onClick={() => {
            if (stats.withdrawableBalance <= 0) {
              toast.error('You do not have any withdrawable balance currently')
              return
            }
            setIsPayoutModalOpen(true)
          }}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground h-14 px-8 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dash-brand/20 transition-all active:scale-95 z-10 self-start md:self-auto cursor-pointer"
        >
          <Plus size={16} /> Request Withdrawal
        </Button>
      </motion.div>

      {/* ADMIN PENDING ACTIONS PORTAL (Admin only) */}
      {isAdmin && (
        <motion.div variants={fadeUp}>
          <AdminPayoutApprovals
            allAdminPayouts={allAdminPayouts || []}
            onAdminAction={handleAdminAction}
            isUpdating={updatePayoutStatus.isPending}
          />
        </motion.div>
      )}

      {/* CORE PAYMENT TRANSACTIONS & SUMMARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Transactions & Product Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payment History & Transactions */}
          <motion.div variants={fadeUp}>
            <RevenueTransactionsTable recentTransactions={recentTransactions} />
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
                Payout Settlement History
              </h3>
              <p className="text-[11px] font-bold text-muted-dark mt-0.5">
                Track your payout withdrawal request updates.
              </p>
            </div>

            <div className="space-y-4">
              {payoutRequests.length === 0 ? (
                <div className="text-center py-10 bg-muted-light rounded-2xl border border-border/30 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-dark">
                    <Clock size={16} />
                  </div>
                  <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                    No payout requests placed
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
              Safety Settlement Guarantee
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground/85 leading-relaxed">
              Platform settlements are subject to a standard 10% commission.
              Payout requests are verified by auditing dispute histories and
              cleared within 24-48 hours.
            </p>
            <div className="border-t border-border/30 pt-4 flex items-center gap-2 text-[10px] font-black text-muted-dark uppercase tracking-widest">
              <Lock size={12} className="text-emerald-600" /> BANK-LEVEL SSL
              ENCRYPTED
            </div>
          </motion.div>
        </div>
      </div>

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
