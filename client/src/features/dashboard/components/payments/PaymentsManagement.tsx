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
  TrendingUp,
  Coins,
  AlertCircle,
  Filter,
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
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { toast } from 'sonner'

export const PaymentsManagement = () => {
  const { data: session } = authClient.useSession()
  const role = session?.user.role || 'owner'
  const isAdmin = role === 'admin' || role === 'superAdmin'

  // Fetch queries
  const { data: dashboardData, isLoading: isDashboardLoading } =
    usePayoutDashboard()
  const { data: allAdminPayouts, isLoading: isAdminPayoutsLoading } =
    useAllPayoutRequests({ enabled: isAdmin })

  // Mutations
  const createPayout = useCreatePayoutRequest()
  const updatePayoutStatus = useUpdatePayoutStatus()

  // Dialog & Form States
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('all')

  // Admin action states
  const [selectedAdminPayout, setSelectedAdminPayout] = useState<any | null>(
    null,
  )
  const [adminNotes, setAdminNotes] = useState('')
  const [adminActionType, setAdminActionType] = useState<
    'approved' | 'rejected' | 'paid' | null
  >(null)

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(payoutAmount)

    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payout amount')
      return
    }

    const maxWithdrawable = dashboardData?.stats?.withdrawableBalance || 0
    if (amt > maxWithdrawable) {
      toast.error(
        `Insufficient balance! Your maximum withdrawable balance is ₹${maxWithdrawable.toLocaleString()}`,
      )
      return
    }

    createPayout.mutate(amt, {
      onSuccess: () => {
        toast.success('Payout request successfully submitted! 🎉')
        setIsPayoutModalOpen(false)
        setPayoutAmount('')
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

  const handleAdminAction = () => {
    if (!selectedAdminPayout || !adminActionType) return

    updatePayoutStatus.mutate(
      {
        id: selectedAdminPayout.id,
        status: adminActionType,
        notes: adminNotes,
      },
      {
        onSuccess: () => {
          toast.success(`Payout successfully updated to ${adminActionType}!`)
          setSelectedAdminPayout(null)
          setAdminNotes('')
          setAdminActionType(null)
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
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 bg-gray-150 rounded-md w-32" />
          <div className="h-6 bg-gray-200 rounded-lg w-48" />
        </div>
        <div className="h-[400px] bg-white border border-slate-100 rounded-[2rem] shadow-sm" />
      </div>
    )
  }

  // Extract calculations
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

  // Dynamic products list for filtering transactions
  const uniqueProducts = Array.from(
    new Set(
      recentTransactions.map((t: any) => t.product?.title).filter(Boolean),
    ),
  )

  // Filtered recent transactions
  const filteredTransactions = recentTransactions.filter((trans: any) => {
    return selectedProduct === 'all' || trans.product?.title === selectedProduct
  })

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
          <Badge className="bg-red-50 text-red-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <XCircle size={10} /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-50 text-amber-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <Clock size={10} /> Pending
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs / Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Dashboard</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-emerald-600 font-extrabold">
              Earnings & Payouts
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <IndianRupee className="text-emerald-600" size={26} />
            Earnings & Payouts
          </h2>
        </div>

        {/* Date Month Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
          <Calendar size={14} className="text-emerald-600" />
          <span className="text-xs font-black text-slate-600 tracking-wider">
            {format(new Date(), 'MMMM yyyy')}
          </span>
        </div>
      </div>

      {/* CORE EARNINGS ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Total Revenue
            </span>
            <h3 className="text-xl font-black text-slate-800">
              ₹{stats.totalEarnings.toLocaleString()}
            </h3>
            <span className="text-[9px] font-bold text-slate-400">
              All successful orders
            </span>
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar size={22} strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Monthly Revenue
            </span>
            <h3 className="text-xl font-black text-slate-800">
              ₹{stats.monthlyEarnings.toLocaleString()}
            </h3>
            <span className="text-[9px] font-bold text-blue-500 font-medium">
              This current month
            </span>
          </div>
        </div>

        {/* Platform Deduction */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins size={22} strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Commission (10%)
            </span>
            <h3 className="text-xl font-black text-slate-800">
              ₹{stats.platformCommission.toLocaleString()}
            </h3>
            <span className="text-[9px] font-bold text-amber-500">
              Platform charge
            </span>
          </div>
        </div>

        {/* Completed Payouts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 size={22} strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Withdrawn Paid
            </span>
            <h3 className="text-xl font-black text-slate-800">
              ₹{stats.completedPayouts.toLocaleString()}
            </h3>
            <span className="text-[9px] font-bold text-indigo-500">
              Successfully settled
            </span>
          </div>
        </div>
      </div>

      {/* WITHDRAWABLE BALANCE HEADER & TRIGGER BUTTON */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 text-white">
          <Zap size={250} strokeWidth={1} />
        </div>
        <div className="space-y-2 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-500/20 px-2 py-0.5 rounded">
            Settlement Wallet
          </span>
          <h3 className="text-sm font-semibold text-slate-400">
            Available Withdrawable Balance
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black">
              ₹{stats.withdrawableBalance.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
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
          className="bg-[#059669] hover:bg-[#059669]/90 text-white h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 z-10 self-start md:self-auto"
        >
          <Plus size={16} /> Request Withdrawal
        </Button>
      </div>

      {/* ADMIN PENDING ACTIONS PORTAL (Admin/SuperAdmin only) */}
      {isAdmin && allAdminPayouts && allAdminPayouts.length > 0 && (
        <div className="bg-[#faf7f0] border-2 border-emerald-600/20 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div>
            <h3 className="text-[15px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-emerald-600" />
              Admin Payout Approvals Portal
            </h3>
            <p className="text-[11px] font-semibold text-slate-500">
              Review, approve or reject payout requests from listing listers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAdminPayouts
              .filter(
                (p: any) => p.status === 'pending' || p.status === 'approved',
              )
              .map((payout: any) => (
                <div
                  key={payout.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        {payout.owner?.image ? (
                          <img
                            src={payout.owner.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-200 uppercase">
                            {payout.owner?.name?.slice(0, 2) || 'OW'}
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800">
                          {payout.owner?.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold truncate">
                          {payout.owner?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-[#1e293b] block">
                        ₹{payout.amount.toLocaleString()}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 block">
                        {format(new Date(payout.createdAt), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedAdminPayout(payout)
                        setAdminActionType('paid')
                      }}
                      className="flex-1 h-9 rounded-xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[10px] uppercase"
                    >
                      Mark Paid
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedAdminPayout(payout)
                        setAdminActionType('rejected')
                      }}
                      variant="outline"
                      className="flex-1 h-9 rounded-xl text-red-500 border border-red-200 hover:bg-red-50 font-black text-[10px] uppercase"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CORE PAYMENT TRANSACTIONS & SUMMARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Transactions & Product Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payment History & Transactions */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="text-[15px] font-black text-slate-800">
                  Recent Revenue Transactions
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  Successful orders received from customers.
                </p>
              </div>

              {/* Transactions Product Filter */}
              <div className="flex items-center gap-1.5">
                <Filter size={12} className="text-slate-400" />
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="h-8 rounded-lg border border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-700 outline-none focus:border-slate-200 transition-all cursor-pointer"
                >
                  <option value="all">All Products</option>
                  {uniqueProducts.map((p: any) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    No successful orders found
                  </span>
                </div>
              ) : (
                filteredTransactions.slice(0, 5).map((trans: any) => (
                  <div
                    key={trans.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                        {trans.product?.image ? (
                          <img
                            src={trans.product.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-150 flex items-center justify-center font-bold text-slate-500 uppercase">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          ID #ORD-{trans.id.slice(-5).toUpperCase()}
                        </p>
                        <p className="text-xs font-black text-slate-800 leading-snug">
                          {trans.product?.title}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400">
                          {format(
                            new Date(trans.createdAt),
                            'dd MMM yyyy, hh:mm a',
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800">
                          ₹{trans.totalPrice.toLocaleString()}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 block">
                          Gross
                        </span>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-slate-300 group-hover:text-emerald-600 transition-colors"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Earnings Breakdown by Product */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-[15px] font-black text-slate-800">
                Earnings Breakdown by Product
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                Total revenue generated per listing.
              </p>
            </div>
            <div className="space-y-4">
              {productBreakdown.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    No listings product earnings found
                  </span>
                </div>
              ) : (
                productBreakdown.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-150 flex items-center justify-center font-bold text-slate-500 uppercase">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800 truncate max-w-xs">
                          {item.title}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-400">
                          {item.bookingCount} successful rentals
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600">
                        ₹{item.totalEarned.toLocaleString()}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 block">
                        Total Earnings
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payout History Requests */}
        <div className="space-y-8">
          {/* Payout Requests History list */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-[15px] font-black text-slate-800">
                Payout Settlement History
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                Track your payout withdrawal request updates.
              </p>
            </div>

            <div className="space-y-4">
              {payoutRequests.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Clock size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    No payout requests placed
                  </span>
                </div>
              ) : (
                payoutRequests.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">
                        ₹{req.amount.toLocaleString()}
                      </span>
                      <div>{getPayoutStatusBadge(req.status)}</div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                      <span>
                        {format(
                          new Date(req.createdAt),
                          'dd MMM yyyy, hh:mm a',
                        )}
                      </span>
                      {req.notes && (
                        <span
                          className="text-red-500 max-w-[150px] truncate"
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
          </div>

          {/* Secure details safety card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Safety Settlement Guarantee
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              Platform settlements are subject to a standard 10% commission.
              Payout requests are verified by auditing dispute histories and
              cleared within 24-48 hours.
            </p>
            <div className="border-t border-slate-50 pt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Lock size={12} className="text-emerald-600" /> BANK-LEVEL SSL
              ENCRYPTED
            </div>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL REQUEST FORM MODAL POPUP */}
      <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
        <DialogContent className="max-w-md p-8 border-none bg-white rounded-[2.5rem] shadow-2xl font-sans">
          <form onSubmit={handleRequestPayout} className="space-y-6">
            <div className="space-y-2.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded">
                Initiate Settlement
              </span>
              <h3 className="text-xl font-extrabold text-slate-800">
                Request Payout
              </h3>
              <p className="text-[11px] font-bold text-slate-400">
                Amount will be reviewed by admin and settled directly to your
                registered bank account/UPI within 24-48 hours.
              </p>
            </div>

            {/* Input field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full h-14 pl-8 pr-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-black text-slate-800 outline-none focus:border-[#059669] focus:bg-white transition-all"
                  max={stats.withdrawableBalance}
                  required
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 block pt-1">
                Max withdrawable:{' '}
                <strong className="text-emerald-600 font-black">
                  ₹{stats.withdrawableBalance.toLocaleString()}
                </strong>
              </span>

              {session?.user &&
              ((session.user as any).upiId ||
                (session.user as any).bankName) ? (
                <span className="text-[9px] font-bold text-emerald-600 block mt-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                  Direct transfer to:{' '}
                  {(session.user as any).upiId
                    ? `UPI: ${(session.user as any).upiId}`
                    : `${(session.user as any).bankName} (A/C: *${(session.user as any).accountNumber?.slice(-4)})`}
                </span>
              ) : (
                <span className="text-[9px] font-bold text-amber-600 block mt-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                  ⚠️ No active payout method set! Set your UPI / Bank account
                  details in the{' '}
                  <strong className="font-black underline">Settings</strong> tab
                  to ensure direct settlement.
                </span>
              )}
            </div>

            {/* Platform notice */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex items-start gap-2">
              <AlertCircle
                size={16}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">
                By requesting this withdrawal, you authorize standard 10%
                platform fee calculations against your gross earnings bookings
                database.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                variant="ghost"
                className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-wider text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                disabled={createPayout.isPending}
              >
                {createPayout.isPending ? 'Requesting...' : 'Request Payout'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADMIN PROCESS ACTION DIALOG MODAL */}
      <Dialog
        open={!!selectedAdminPayout}
        onOpenChange={(open) => !open && setSelectedAdminPayout(null)}
      >
        {selectedAdminPayout && (
          <DialogContent className="max-w-md p-8 border-none bg-white rounded-[2.5rem] shadow-2xl font-sans">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded">
                  Admin Action Portal
                </span>
                <h3 className="text-xl font-extrabold text-slate-800">
                  {adminActionType === 'rejected'
                    ? 'Reject Payout Request'
                    : 'Approve & Mark as Paid'}
                </h3>
                <p className="text-[11px] font-bold text-slate-400">
                  Request by <strong>{selectedAdminPayout.owner?.name}</strong>{' '}
                  for{' '}
                  <strong>
                    ₹{selectedAdminPayout.amount.toLocaleString()}
                  </strong>
                  .
                </p>
              </div>

              {/* Action Notes Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Notes / Reason / Transaction ID
                </label>
                <textarea
                  placeholder={
                    adminActionType === 'rejected'
                      ? 'Enter rejection reason...'
                      : 'Enter transaction ID or payment notes...'
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-800 outline-none focus:border-[#059669] transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setSelectedAdminPayout(null)
                    setAdminNotes('')
                    setAdminActionType(null)
                  }}
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-wider text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdminAction}
                  className={`flex-1 h-12 rounded-xl text-white font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 ${
                    adminActionType === 'rejected'
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-100'
                      : 'bg-[#059669] hover:bg-[#059669]/90 shadow-emerald-100'
                  }`}
                  disabled={updatePayoutStatus.isPending}
                >
                  {updatePayoutStatus.isPending
                    ? 'Updating...'
                    : adminActionType === 'rejected'
                      ? 'Confirm Reject'
                      : 'Confirm Pay'}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
