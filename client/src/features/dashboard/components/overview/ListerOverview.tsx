import { useState } from 'react'
import { StatCard } from './StatCard'
import {
  Building,
  Coins,
  ShoppingBag,
  Star,
  Check,
  X,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  IndianRupee,
  Activity,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Clock,
  ThumbsUp,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { usePayoutDashboard, useCreatePayoutRequest } from '#/hook'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

interface ListerOverviewProps {
  myListings: any[] | undefined
  listLoading: boolean
  listerOrders: any[] | undefined
  ordersLoading: boolean
  handleStatusUpdate: (
    id: string,
    status: 'approved' | 'rejected',
  ) => Promise<void>
}

export const ListerOverview = ({
  myListings,
  listLoading,
  listerOrders,
  ordersLoading,
  handleStatusUpdate,
}: ListerOverviewProps) => {
  const [isPayoutOpen, setIsPayoutOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // 1. Fetch live payout wallet data
  const { data: payoutDashboard, refetch: refetchPayout } = usePayoutDashboard()
  const createPayoutRequest = useCreatePayoutRequest()

  const payoutStats = payoutDashboard?.stats || {
    totalEarnings: 0,
    monthlyEarnings: 0,
    platformCommission: 0,
    netEarnings: 0,
    withdrawableBalance: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
  }

  // Calculate stats from orders
  const totalEarnings =
    listerOrders
      ?.filter(
        (o: any) =>
          o.status === 'approved' ||
          o.status === 'completed' ||
          o.status === 'confirmed',
      )
      ?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0

  const pendingOrders =
    listerOrders?.filter((o: any) => o.status === 'pending') || []

  const activeRentalsCount =
    listerOrders?.filter(
      (o: any) => o.status === 'active' || o.status === 'confirmed',
    ).length || 0

  // Compute average rating from reviews
  const allRatings: number[] = []
  listerOrders?.forEach((o: any) => {
    if (o.product?.reviews?.length) {
      o.product.reviews.forEach((r: any) => allRatings.push(r.rating))
    }
  })
  const avgRating =
    allRatings.length > 0
      ? (allRatings.reduce((s, r) => s + r, 0) / allRatings.length).toFixed(1)
      : '—'

  // Dynamic grouping of lister orders by month for the chart
  const monthlyEarningsData = (() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const last6Months: { name: string; value: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6Months.push({
        name: months[d.getMonth()],
        value: 0,
      })
    }

    listerOrders?.forEach((order: any) => {
      if (
        order.status === 'approved' ||
        order.status === 'completed' ||
        order.status === 'confirmed' ||
        order.status === 'active'
      ) {
        const date = new Date(order.createdAt || order.startDate)
        const monthName = months[date.getMonth()]
        const match = last6Months.find((m) => m.name === monthName)
        if (match) {
          match.value += order.totalPrice || 0
        }
      }
    })

    return last6Months
  })()

  const maxMonthlyEarnings = Math.max(
    ...monthlyEarningsData.map((m) => m.value),
    1000,
  )

  // Group earnings by listing product with percentages
  const propertyEarningsBreakdown = (() => {
    const propertyMap: Record<
      string,
      { title: string; image: string; earned: number; count: number }
    > = {}

    listerOrders?.forEach((order: any) => {
      if (
        order.status === 'approved' ||
        order.status === 'completed' ||
        order.status === 'confirmed' ||
        order.status === 'active'
      ) {
        const prod = order.product
        if (!prod) return

        if (!propertyMap[prod.id]) {
          propertyMap[prod.id] = {
            title: prod.title,
            image:
              prod.images?.[0] ||
              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
            earned: 0,
            count: 0,
          }
        }
        propertyMap[prod.id].earned += order.totalPrice || 0
        propertyMap[prod.id].count += 1
      }
    })

    const list = Object.values(propertyMap).sort((a, b) => b.earned - a.earned)
    const maxEarned = list[0]?.earned || 1

    return list.slice(0, 4).map((item) => ({
      ...item,
      percentage: Math.round((item.earned / maxEarned) * 100),
    }))
  })()

  // Handle direct lister cash settlement request
  const handlePayoutSubmit = async () => {
    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payout amount')
      return
    }

    if (amt > payoutStats.withdrawableBalance) {
      toast.error(
        `Maximum withdrawable balance is ₹${payoutStats.withdrawableBalance.toLocaleString()}`,
      )
      return
    }

    try {
      await createPayoutRequest.mutateAsync(amt)
      toast.success('Payout request successfully submitted! 🎉')
      setIsPayoutOpen(false)
      setWithdrawAmount('')
      refetchPayout()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request withdrawal')
    }
  }

  return (
    <div
      className={cn(
        'space-y-8',
        'animate-in',
        'fade-in',
        'duration-500',
        'font-sans',
      )}
    >
      {/* Header Panel */}
      <div
        className={cn(
          'flex',
          'flex-col',
          'md:flex-row',
          'md:items-center',
          'justify-between',
          'gap-6',
        )}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={10} className="animate-spin duration-1000" />
              Lister Workspace Active
            </span>
          </div>
          <h1
            className={cn(
              'text-3xl',
              'font-black',
              'text-foreground',
              'tracking-tight',
            )}
          >
            Lister Hub Dashboard
          </h1>
          <p
            className={cn('text-sm', 'text-muted-foreground/80', 'font-medium')}
          >
            Monitor rental schedules, review tenant bookings, and settle payouts
            securely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/products">
            <Button
              className={cn(
                'bg-primary',
                'hover:bg-primary/95',
                'text-primary-foreground',
                'font-extrabold',
                'h-12',
                'px-6',
                'rounded-2xl',
                'flex',
                'items-center',
                'gap-2',
                'shadow-lg',
                'shadow-primary/15',
                'transition-all',
                'active:scale-[0.98]',
              )}
            >
              <Building size={16} />
              Add Property Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Core Operational Stats Row */}
      <div
        className={cn(
          'grid',
          'grid-cols-1',
          'sm:grid-cols-2',
          'xl:grid-cols-4',
          'gap-6',
        )}
      >
        <StatCard
          title="Published Rentals"
          value={listLoading ? '...' : myListings?.length?.toString() || '0'}
          change={`${myListings?.length ? 'Inventory Live' : 'No properties yet'}`}
          isPositive={true}
          icon={Building}
          iconBg="bg-primary-soft"
          iconColor="bg-primary-light"
          sparklineData={[12, 18, 15, 20, 25, 28, myListings?.length || 0]}
        />
        <StatCard
          title="Total Rental Income"
          value={
            ordersLoading ? '...' : `₹ ${totalEarnings.toLocaleString('en-IN')}`
          }
          change="Gross Earned"
          isPositive={true}
          icon={Coins}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[
            5000,
            12000,
            15000,
            22000,
            31000,
            42000,
            totalEarnings,
          ]}
        />
        <StatCard
          title="Bookings Received"
          value={
            ordersLoading ? '...' : listerOrders?.length?.toString() || '0'
          }
          change={`${pendingOrders.length} Pending Approval`}
          isPositive={pendingOrders.length > 0}
          icon={ShoppingBag}
          iconBg="bg-primary-soft"
          iconColor="bg-primary-light"
          sparklineData={[4, 8, 12, 16, 21, 26, listerOrders?.length || 0]}
        />
        <StatCard
          title="Customer Feedback"
          value={avgRating}
          change={avgRating !== '—' ? 'Avg. Guest Rating' : 'No reviews yet'}
          isPositive={true}
          icon={Star}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[
            4.2,
            4.5,
            4.6,
            4.8,
            4.7,
            4.9,
            parseFloat(avgRating) || 0,
          ]}
        />
      </div>

      {/* Analytics Insights Dashboard Row (Matches Admin Richness) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Visual Earnings Performance Bar Graph */}
        <div className="xl:col-span-2 bg-card border border-border/30 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-foreground">
                Earnings Analytics
              </h3>
              <p className="text-xs text-muted-foreground/75 font-semibold">
                Overview of income generated over the last 6 months.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
              <TrendingUp size={12} />
              +15.4% YoY Growth
            </div>
          </div>

          {ordersLoading ? (
            <div className="h-52 w-full bg-muted-light rounded-2xl animate-pulse" />
          ) : (
            <div className="space-y-4">
              {/* Dynamic Pure-CSS Bar Graph */}
              <div className="relative h-44 w-full flex items-end justify-between gap-1 pt-6">
                {/* Chart Left Y-Axis */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-muted-foreground/60 font-black">
                  <span>₹{Math.round(maxMonthlyEarnings / 1000)}k</span>
                  <span>₹{Math.round((maxMonthlyEarnings * 0.5) / 1000)}k</span>
                  <span>0</span>
                </div>

                {/* Graph bars container */}
                <div className="ml-10 flex-1 h-full flex items-end justify-around gap-2 pb-6 border-b border-border/20">
                  {monthlyEarningsData.map((bar, i) => {
                    const heightPercent = Math.max(
                      (bar.value / maxMonthlyEarnings) * 100,
                      4,
                    )
                    return (
                      <div
                        key={i}
                        className="flex-1 max-w-[42px] bg-primary/20 hover:bg-primary rounded-t-xl transition-all duration-300 group relative flex justify-center cursor-pointer"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Hover Tooltip tooltip */}
                        <div className="absolute -top-8 bg-foreground text-primary-foreground text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none whitespace-nowrap z-20">
                          ₹{bar.value.toLocaleString('en-IN')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="ml-10 flex justify-around text-[10px] font-bold text-muted-foreground/70 uppercase">
                {monthlyEarningsData.map((b) => (
                  <span key={b.name}>{b.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Property Revenue Contribution Breakdown (Progress chart) */}
        <div className="bg-card border border-border/30 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">
              Top Listing Performance
            </h3>
            <p className="text-xs text-muted-foreground/75 font-semibold mb-6">
              Total revenue breakdown sorted by your individual properties.
            </p>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted-light rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : propertyEarningsBreakdown.length > 0 ? (
              <div className="space-y-5">
                {propertyEarningsBreakdown.map((item) => (
                  <div key={item.title} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 overflow-hidden max-w-[70%]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-7 h-7 rounded-lg object-cover bg-muted shrink-0"
                        />
                        <span className="truncate text-foreground/90">
                          {item.title}
                        </span>
                      </div>
                      <span className="font-extrabold text-foreground shrink-0">
                        ₹{item.earned.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-muted-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Building
                  className="mx-auto text-muted-foreground/30 mb-3"
                  size={32}
                />
                <p className="text-xs font-bold text-muted-foreground/70">
                  No booking income records yet.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/20 flex items-center gap-2 text-[10px] font-black text-muted-foreground/80 uppercase">
            <Activity size={14} className="text-primary" />
            Performance based on actual rental bookings
          </div>
        </div>
      </div>

      {/* Main Core Management Block */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Recent Bookings Table (Active management portal) */}
        <div className="xl:col-span-2 bg-card rounded-[2rem] border border-border/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-foreground">
                Active Booking Requests
              </h3>
              <p className="text-xs text-muted-foreground/75 font-semibold">
                Approve or decline rental reservations from platform tenants.
              </p>
            </div>
            {pendingOrders.length > 0 && (
              <span className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-xl text-[10px] font-black animate-pulse flex items-center gap-1">
                <Clock size={10} />
                {pendingOrders.length} Pending
              </span>
            )}
          </div>

          {ordersLoading ? (
            <div className="space-y-4 py-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted-light rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : listerOrders && listerOrders.length > 0 ? (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border/30 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    <th className="pb-3 font-semibold">Tenant</th>
                    <th className="pb-3 font-semibold">Property</th>
                    <th className="pb-3 font-semibold">Period</th>
                    <th className="pb-3 font-semibold">Income</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs font-bold text-foreground/80">
                  {listerOrders.slice(0, 5).map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted-light/20 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black uppercase text-xs">
                            {order.user?.name?.[0] || 'U'}
                          </div>
                          <div className="max-w-[100px] truncate">
                            <p className="font-extrabold text-foreground">
                              {order.user?.name || 'Renter'}
                            </p>
                            <p className="text-[9px] text-muted-foreground truncate">
                              {order.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-extrabold truncate max-w-[120px]">
                        {order.product?.title || 'Property item'}
                      </td>
                      <td className="py-3 text-[10px] text-muted-foreground/85">
                        {new Date(order.startDate).toLocaleDateString()} -{' '}
                        {new Date(order.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-black text-foreground">
                        ₹{order.totalPrice?.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider',
                            order.status === 'pending'
                              ? 'bg-warning text-warning-foreground border border-amber-200'
                              : order.status === 'approved' ||
                                  order.status === 'confirmed'
                                ? 'bg-primary-soft text-primary'
                                : order.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-muted/50 text-muted-foreground',
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {order.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleStatusUpdate(order.id, 'approved')
                              }
                              className="w-7 h-7 rounded-md bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center cursor-pointer"
                              title="Approve"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleStatusUpdate(order.id, 'rejected')
                              }
                              className="w-7 h-7 rounded-md bg-danger text-destructive hover:bg-destructive hover:text-primary-foreground transition-all flex items-center justify-center cursor-pointer"
                              title="Decline"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-extrabold">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <ShoppingBag
                size={40}
                className="mx-auto text-muted-foreground/30 mb-3"
              />
              <h4 className="font-extrabold text-foreground">
                No bookings received
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Publish listings in the marketplace to accept reservations.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Settlement Wallet Hub & Direct Cash Withdrawal */}
        <div className="bg-card rounded-[2rem] border border-border/30 shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-foreground">
                Settlement Wallet
              </h3>
              <p className="text-xs text-muted-foreground/75 font-semibold">
                Manage your available balance and request cash withdrawals.
              </p>
            </div>

            {/* Wallet Graphic Container */}
            <div className="bg-foreground text-primary-foreground p-6 rounded-[2rem] shadow-md relative overflow-hidden space-y-4">
              <div className="absolute right-0 top-0 opacity-10 translate-x-1/6 -translate-y-1/6 text-primary-foreground">
                <Wallet size={120} strokeWidth={1} />
              </div>

              <div className="space-y-1.5 relative z-10">
                <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  Wallet Balance
                </span>
                <p className="text-xs text-muted-foreground">
                  Available for Withdrawal
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">
                    ₹{payoutStats.withdrawableBalance.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold">
                    (Net after Commission)
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (payoutStats.withdrawableBalance <= 0) {
                    toast.error(
                      'You do not have any withdrawable balance currently',
                    )
                    return
                  }
                  setIsPayoutOpen(true)
                }}
                className="w-full h-11 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 relative z-10 active:scale-[0.98] cursor-pointer"
              >
                <Wallet size={14} /> Request Direct Payout
              </Button>
            </div>

            {/* Platform Fees & Commission Info Details */}
            <div className="p-4 rounded-2xl bg-muted-light/60 border border-border/30 space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Total Gross Earnings:</span>
                <span className="text-foreground">
                  ₹{payoutStats.totalEarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Platform Commission (10%):</span>
                <span className="text-destructive font-semibold">
                  - ₹{payoutStats.platformCommission.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs font-extrabold border-t border-border/20 pt-2.5 text-foreground">
                <span>Net Earnings:</span>
                <span className="text-primary">
                  ₹{payoutStats.netEarnings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/20 flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase">
            <ThumbsUp size={12} className="text-primary" />
            Payout requests are cleared in 24-48 hours.
          </div>
        </div>
      </div>

      {/* Modern Transaction Ledger (Recent payout logs at the bottom) */}
      <div className="bg-card rounded-[2rem] border border-border/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-foreground">
              Lister Transaction Ledger
            </h3>
            <p className="text-xs text-muted-foreground/75 font-semibold">
              Recent ledger record of payouts and rental transactions.
            </p>
          </div>
          <Link to="/account/payments">
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-muted-light cursor-pointer active:scale-[0.98] border-border/40"
            >
              View Full Statement
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>

        {payoutDashboard?.recentTransactions &&
        payoutDashboard.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-border/30 text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs font-bold text-foreground/80">
                {payoutDashboard.recentTransactions
                  .slice(0, 4)
                  .map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-muted-light/20 transition-colors"
                    >
                      <td className="py-3 font-mono text-[10px] text-muted-foreground">
                        TXN-{tx.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                        <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded">
                          Rental Credit
                        </span>
                      </td>
                      <td className="py-3 font-extrabold flex items-center gap-2">
                        {tx.product?.image && (
                          <img
                            src={tx.product.image}
                            className="w-6 h-6 rounded-md object-cover"
                          />
                        )}
                        <span className="truncate max-w-[150px]">
                          {tx.product?.title || 'Untitled Property'}
                        </span>
                      </td>
                      <td className="py-3 text-[10px] text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-black text-primary">
                        ₹{tx.totalPrice?.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
            No payments or ledger history logged yet.
          </div>
        )}
      </div>

      {/* Payout Cash Settlement Dialog (Direct payout request logic) */}
      <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
        <DialogContent className="rounded-[2rem] border border-border/30 shadow-2xl p-8 max-w-sm bg-card animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <IndianRupee className="text-primary" size={20} />
              Request Cash Payout
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Submit a direct payout settlement request to your bank. Maximum
              withdrawable balance is
              <span className="font-extrabold text-foreground ml-1">
                ₹{payoutStats.withdrawableBalance.toLocaleString()}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-xs font-extrabold text-foreground/90 uppercase tracking-wide"
              >
                Withdrawal Amount (INR)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-foreground">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8 h-12 bg-muted-light/60 border-none rounded-xl text-foreground font-black placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPayoutOpen(false)}
              className="h-11 flex-1 rounded-xl font-extrabold text-xs text-muted-foreground hover:bg-muted-light active:scale-[0.98] border-border/30 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayoutSubmit}
              disabled={createPayoutRequest.isPending}
              className="h-11 flex-1 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              {createPayoutRequest.isPending ? 'Processing...' : 'Confirm'}
              <ArrowRight size={14} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
