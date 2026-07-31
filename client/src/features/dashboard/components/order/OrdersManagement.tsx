import { useState } from 'react'
import { useOrders, useUpdateRentalStatus } from '#/hook'
import { authClient } from '#/lib/auth/auth-client'
import { useTranslation } from '#/context/TranslationContext'
import {
  ShoppingCart,
  IndianRupee,
  Clock,
  ChevronRight,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
} from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { OrderDetailsView } from './components/OrderDetailsView'
import { toast } from 'sonner'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

export const OrdersManagement = () => {
  const { t, formatNumber } = useTranslation()
  const { data: orders, isLoading } = useOrders()
  const { data: session } = authClient.useSession()
  const currentUser = session?.user
  const isAdmin = currentUser?.role === 'admin'
  const [currentView, setCurrentView] = useState<'my' | 'all'>('my')

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const updateStatus = useUpdateRentalStatus()
  const [pendingAction, setPendingAction] = useState<{
    id: string
    action: 'confirm' | 'reject'
    title: string
  } | null>(null)

  const filteredOrders =
    orders?.filter((order: any) => {
      if (isAdmin && currentView === 'my') {
        return order.product?.userId === currentUser?.id
      }
      return true
    }) || []
  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            t('Order status updated to {newStatus}').replace(
              '{newStatus}',
              newStatus,
            ),
          )
        },
        onError: () => {
          toast.error(t('Failed to update status'))
        },
      },
    )
  }

  const currentOrder = orders?.find((o: any) => o.id === selectedOrderId)

  const handleOpenDetails = (order: any) => {
    setSelectedOrderId(order.id)
  }

  const handleBackToList = () => {
    setSelectedOrderId(null)
  }

  if (currentOrder) {
    return <OrderDetailsView order={currentOrder} onBack={handleBackToList} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="space-y-2.5">
          <div className="h-7 bg-muted rounded-lg w-48" />
          <div className="h-4 bg-muted/50 rounded-md w-96" />
        </div>
        {/* Orders list */}
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-card p-6 rounded-[2rem] border border-border/30 shadow-sm flex flex-col lg:flex-row gap-8"
            >
              {/* Product Info */}
              <div className="flex gap-4 flex-1">
                <div className="w-20 h-20 rounded-2xl bg-muted/50 shrink-0" />
                <div className="flex flex-col justify-center gap-2">
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted/40 rounded w-16" />
                    <div className="h-5 bg-muted/40 rounded w-16" />
                  </div>
                  <div className="h-5 bg-muted rounded w-48" />
                </div>
              </div>
              {/* Renter Info */}
              <div className="flex items-center gap-4 bg-muted-light/50 p-4 rounded-2xl border border-border/30 flex-1">
                <div className="w-10 h-10 rounded-xl bg-muted/40 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 bg-muted rounded w-12" />
                  <div className="h-3.5 bg-muted rounded w-24" />
                  <div className="h-2.5 bg-muted/40 rounded w-32" />
                </div>
              </div>
              {/* Date & Price */}
              <div className="flex items-center gap-8 lg:gap-12 min-w-fit">
                <div className="space-y-1.5">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-28" />
                </div>
                <div className="space-y-1.5 items-end flex flex-col">
                  <div className="h-3 bg-muted rounded w-12" />
                  <div className="h-5 bg-muted rounded w-20" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] border border-dashed border-border">
        <div className="w-20 h-20 bg-muted-light rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="text-muted-dark" size={40} />
        </div>
        <h3 className="text-xl font-bold text-dash-text">
          {t('No Orders Found')}
        </h3>
        <p className="text-dash-text-soft mt-2 max-w-xs text-center font-medium">
          {t('There are no rental orders for your products yet.')}
        </p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-primary-soft text-primary border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <CheckCircle2 size={12} /> {t('Confirmed')}
          </Badge>
        )
      case 'active':
        return (
          <Badge className="bg-info text-info-foreground border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <Clock size={12} /> {t('Active')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-primary-soft text-primary border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <CheckCircle2 size={12} /> {t('Completed')}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-danger text-destructive border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <XCircle size={12} /> {t('Rejected')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-danger text-destructive border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <XCircle size={12} /> {t('Cancelled')}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <AlertCircle size={12} /> {t('Pending')}
          </Badge>
        )
    }
  }
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-dash-text flex items-center gap-3">
            <ShoppingCart className="text-dash-brand" size={28} />
            {t('Booking Requests & Orders')}
          </h2>
          <p className="text-dash-text-soft text-sm font-medium">
            {t('Track rental reservations, approvals, and order statuses.')}
          </p>
        </div>
        {isAdmin ? (
          <div className="flex items-center gap-2 rounded-full bg-dash-bg-soft p-1 self-start sm:self-auto shrink-0">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('my')}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all h-auto cursor-pointer ${
                currentView === 'my'
                  ? 'bg-dash-brand text-primary-foreground hover:bg-dash-brand hover:text-primary-foreground'
                  : 'text-dash-text-soft hover:text-dash-text hover:bg-transparent'
              }`}
            >
              {t('My Orders')}
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
              {t('All Platform Orders')}
            </Button>
          </div>
        ) : null}
      </motion.div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] border border-dashed border-border">
          <div className="w-20 h-20 bg-muted-light rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="text-muted-dark" size={40} />
          </div>
          <h3 className="text-xl font-bold text-dash-text">
            {t('No Orders Found')}
          </h3>
          <p className="text-dash-text-soft mt-2 max-w-xs text-center font-medium">
            {currentView === 'my'
              ? t('There are no rental orders for your products yet.')
              : t('There are no rental orders placed on the platform.')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order: any) => (
            <motion.div
              variants={fadeUp}
              key={order.id}
              className="group bg-card p-6 rounded-[2rem] border border-border/30 shadow-sm hover:shadow-xl hover:border-dash-brand/20 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Info */}
                <div className="flex gap-4 flex-1">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-muted/50">
                    <img
                      src={
                        order.product?.images?.[0] ||
                        'https://via.placeholder.com/150?text=Product'
                      }
                      alt={order.product?.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) =>
                        (e.currentTarget.src =
                          'https://via.placeholder.com/150?text=Product')
                      }
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-dash-brand bg-dash-brand/10 px-2 py-0.5 rounded-md">
                        {order.product?.category?.name || t('Uncategorized')}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <h4 className="text-lg font-extrabold text-dash-text truncate max-w-[250px]">
                      {order.product?.title || t('Untitled Product')}
                    </h4>
                  </div>
                </div>

                {/* Renter Info */}
                <div className="flex items-center gap-4 bg-muted-light/50 p-4 rounded-2xl border border-border/30 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-dash-brand/10 flex items-center justify-center text-dash-brand overflow-hidden">
                    {order.renter.image ? (
                      <img
                        src={order.renter.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={20} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider">
                      {t('Customer')}
                    </span>
                    <span className="text-sm font-extrabold text-dash-text">
                      {order.renter.name || t('Customer')}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-dash-text-soft">
                      <Mail size={10} />
                      {order.renter.email}
                    </div>
                  </div>
                </div>

                {/* Date & Price */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 sm:gap-8 lg:gap-12 min-w-fit">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider mb-1">
                          {t('Rental Period')}
                        </span>
                        <div className="flex items-center gap-2 text-sm font-extrabold text-dash-text whitespace-nowrap">
                          <Calendar
                            size={14}
                            className="text-dash-brand shrink-0"
                          />
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {format(new Date(order.startDate), 'dd MMM')} -{' '}
                            {format(new Date(order.endDate), 'dd MMM, yy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end min-w-fit">
                      <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider mb-1">
                        {t('Income')}
                      </span>
                      <div className="text-lg sm:text-xl font-black text-dash-brand flex items-center">
                        <IndianRupee
                          size={16}
                          strokeWidth={3}
                          className="sm:w-[18px] sm:h-[18px]"
                        />
                        {formatNumber(order.totalPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end w-full sm:w-auto mt-2 sm:mt-0">
                    {order.status === 'pending' && (
                      <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setPendingAction({
                              id: order.id,
                              action: 'confirm',
                              title: order.product?.title || t('this product'),
                            })
                          }
                          className="h-10 sm:h-12 px-3 sm:px-5 rounded-2xl bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground transition-all text-xs font-black flex items-center gap-1.5 active:scale-[0.98] shadow-sm hover:bg-primary hover:text-primary-foreground cursor-pointer flex-1 sm:flex-none"
                        >
                          <CheckCircle2 size={13} />
                          {t('Confirm')}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setPendingAction({
                              id: order.id,
                              action: 'reject',
                              title: order.product?.title || t('this product'),
                            })
                          }
                          className="h-10 sm:h-12 px-3 sm:px-5 rounded-2xl bg-danger text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all text-xs font-black flex items-center gap-1.5 active:scale-[0.98] shadow-sm hover:bg-destructive hover:text-destructive-foreground cursor-pointer flex-1 sm:flex-none"
                        >
                          <XCircle size={13} />
                          {t('Reject')}
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => handleOpenDetails(order)}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-muted-light p-0 flex items-center justify-center text-dash-text-soft hover:bg-dash-brand hover:text-primary-foreground transition-all active:scale-[0.98] duration-300 cursor-pointer shrink-0"
                    >
                      <ChevronRight size={20} strokeWidth={3} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* High-Fidelity Alert Confirmation Dialog */}
      {/* High-Fidelity Alert Confirmation Dialog */}
      <ReusableAlertDialog
        isOpen={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        onConfirm={() => {
          if (pendingAction) {
            if (pendingAction.action === 'confirm') {
              handleStatusUpdate(pendingAction.id, 'confirmed')
            } else {
              handleStatusUpdate(pendingAction.id, 'rejected')
            }
          }
          setPendingAction(null)
        }}
        onCancel={() => setPendingAction(null)}
        title={
          pendingAction?.action === 'confirm'
            ? t('Confirm Booking?')
            : t('Reject Booking?')
        }
        description={
          pendingAction?.action === 'confirm'
            ? t(
                'Are you sure you want to accept this rental booking request for "{title}"? The booking status will be updated to Confirmed, and the renter will receive a notification.',
              ).replace('{title}', pendingAction.title || t('this product'))
            : t(
                'Are you sure you want to reject this rental booking request for "{title}"? This request will be cancelled, and the renter will be notified.',
              ).replace('{title}', pendingAction?.title || t('this product'))
        }
        confirmText={
          pendingAction?.action === 'confirm'
            ? t('Confirm Booking')
            : t('Reject Booking')
        }
        variant={pendingAction?.action === 'confirm' ? 'success' : 'danger'}
        isPending={updateStatus.isPending}
      />
    </motion.div>
  )
}
