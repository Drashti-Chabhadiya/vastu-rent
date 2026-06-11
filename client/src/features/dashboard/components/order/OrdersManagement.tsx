import { useState } from 'react'
import { useOrders, useUpdateRentalStatus } from '#/hook'
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
  const { data: orders, isLoading } = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const updateStatus = useUpdateRentalStatus()
  const [pendingAction, setPendingAction] = useState<{
    id: string
    action: 'confirm' | 'reject'
    title: string
  } | null>(null)
  console.log('orders', orders)
  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${newStatus}`)
        },
        onError: () => {
          toast.error('Failed to update status')
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
        <h3 className="text-xl font-bold text-dash-text">No Orders Found</h3>
        <p className="text-dash-text-soft mt-2 max-w-xs text-center font-medium">
          There are no rental orders for your products yet.
        </p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-primary-soft text-primary border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Confirmed
          </Badge>
        )
      case 'active':
        return (
          <Badge className="bg-info text-info-foreground border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <Clock size={12} /> Active
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-primary-soft text-primary border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Completed
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-danger text-destructive border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <XCircle size={12} /> Rejected
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-danger text-destructive border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <XCircle size={12} /> Cancelled
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <AlertCircle size={12} /> Pending
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
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-dash-text flex items-center gap-3">
            <ShoppingCart className="text-dash-brand" size={28} />
            Product Orders
          </h2>
          <p className="text-dash-text-soft text-sm font-medium">
            Manage incoming rental orders and track your product inventory
            performance.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {orders.map((order: any) => (
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
                      {order.product?.category?.name || 'Uncategorized'}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <h4 className="text-lg font-extrabold text-dash-text truncate max-w-[250px]">
                    {order.product?.title || 'Untitled Product'}
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
                    Customer
                  </span>
                  <span className="text-sm font-extrabold text-dash-text">
                    {order.renter.name || 'Customer'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-dash-text-soft">
                    <Mail size={10} />
                    {order.renter.email}
                  </div>
                </div>
              </div>

              {/* Date & Price */}
              <div className="flex items-center gap-8 lg:gap-12 min-w-fit">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider mb-1">
                      Rental Period
                    </span>
                    <div className="flex items-center gap-2 text-sm font-extrabold text-dash-text">
                      <Calendar size={14} className="text-dash-brand" />
                      {format(new Date(order.startDate), 'dd MMM')} -{' '}
                      {format(new Date(order.endDate), 'dd MMM, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end min-w-[100px]">
                  <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider mb-1">
                    Income
                  </span>
                  <div className="text-xl font-black text-dash-brand flex items-center">
                    <IndianRupee size={18} strokeWidth={3} />
                    {order.totalPrice.toLocaleString()}
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setPendingAction({
                          id: order.id,
                          action: 'confirm',
                          title: order.product?.title || 'this product',
                        })
                      }
                      className="h-12 px-5 rounded-2xl bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground transition-all text-xs font-black flex items-center gap-1.5 active:scale-[0.98] shadow-sm hover:bg-primary hover:text-primary-foreground cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setPendingAction({
                          id: order.id,
                          action: 'reject',
                          title: order.product?.title || 'this product',
                        })
                      }
                      className="h-12 px-5 rounded-2xl bg-danger text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all text-xs font-black flex items-center gap-1.5 active:scale-[0.98] shadow-sm hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                    >
                      <XCircle size={13} />
                      Reject
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={() => handleOpenDetails(order)}
                  className="h-12 w-12 rounded-2xl bg-muted-light p-0 flex items-center justify-center text-dash-text-soft hover:bg-dash-brand hover:text-primary-foreground transition-all active:scale-[0.98] duration-300 cursor-pointer"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
            ? 'Confirm Booking?'
            : 'Reject Booking?'
        }
        description={
          pendingAction?.action === 'confirm'
            ? `Are you sure you want to accept this rental booking request for "${pendingAction.title || 'this product'}"? The booking status will be updated to Confirmed, and the renter will receive a notification.`
            : `Are you sure you want to reject this rental booking request for "${pendingAction?.title || 'this product'}"? This request will be cancelled, and the renter will be notified.`
        }
        confirmText={
          pendingAction?.action === 'confirm'
            ? 'Confirm Booking'
            : 'Reject Booking'
        }
        variant={pendingAction?.action === 'confirm' ? 'success' : 'danger'}
        isPending={updateStatus.isPending}
      />
    </motion.div>
  )
}
