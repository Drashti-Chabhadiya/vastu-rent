import { useState } from 'react'
import {
  ArrowLeft,
  IndianRupee,
  ChevronRight,
  MessageSquare,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '#/components/ui/button'
import { useUpdateRentalStatus } from '#/hook'
import { toast } from 'sonner'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'

// Import extracted sub-components
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderTimelineCard } from './OrderTimelineCard'
import { OrderInvoiceDialog } from './OrderInvoiceDialog'
import { OrderProductDetailsCard } from './OrderProductDetailsCard'
import { OrderCustomerDetailsCard } from './OrderCustomerDetailsCard'
import { OrderPaymentDetailsCard } from './OrderPaymentDetailsCard'

interface OrderDetailsViewProps {
  order: any
  onBack: () => void
}

export const OrderDetailsView = ({ order, onBack }: OrderDetailsViewProps) => {
  const updateStatus = useUpdateRentalStatus()
  const [pendingAction, setPendingAction] = useState<
    'confirm' | 'reject' | 'complete' | null
  >(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)

  const getActionTitle = () => {
    if (pendingAction === 'complete') return 'Complete Rental?'
    if (pendingAction === 'confirm') return 'Confirm Booking?'
    return 'Reject Booking?'
  }

  const getActionDescription = () => {
    if (pendingAction === 'complete')
      return `Are you sure you want to mark this rental booking for "${order.product?.title || 'this product'}" as Completed? The product will be marked as returned, and the renter will be allowed to submit a review.`
    if (pendingAction === 'confirm')
      return `Are you sure you want to accept this rental booking request for "${order.product?.title || 'this product'}"? The booking status will be updated to Confirmed, and the renter will receive a notification.`
    return `Are you sure you want to reject this rental booking request for "${order.product?.title || 'this product'}"? This request will be cancelled, and the renter will be notified.`
  }

  const getActionConfirmText = () => {
    if (pendingAction === 'complete') return 'Complete Rental'
    if (pendingAction === 'confirm') return 'Confirm Booking'
    return 'Reject Booking'
  }

  const getActionVariant = () => {
    if (pendingAction === 'complete' || pendingAction === 'confirm')
      return 'success'
    return 'danger'
  }

  if (!order) return null

  const handleStatusUpdate = (newStatus: string) => {
    updateStatus.mutate(
      { id: order.id, status: newStatus },
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

  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
    return diff || 1
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#f8fafc] -m-8 p-10 min-h-screen">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-dark">
          <span
            className="cursor-pointer hover:text-dash-brand"
            onClick={onBack}
          >
            Dashboard
          </span>
          <ChevronRight size={10} className="text-muted-dark" />
          <span
            className="cursor-pointer hover:text-dash-brand"
            onClick={onBack}
          >
            Orders
          </span>
          <ChevronRight size={10} className="text-muted-dark" />
          <span className="text-dash-brand font-extrabold">Order Details</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground">Order Details</h1>
          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border/30 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-1.5 border-r border-border/30">
              <Calendar size={14} className="text-dash-brand" />
              <span className="text-[11px] font-bold text-muted-foreground">
                {format(new Date(order.startDate), 'dd MMM')} -{' '}
                {format(new Date(order.endDate), 'dd MMM yyyy')}
              </span>
              <ChevronRight size={12} className="rotate-90 text-muted-dark" />
            </div>
            <div className="p-1.5 px-2">
              <div className="w-6 h-6 rounded-lg bg-dash-brand/5 flex items-center justify-center text-dash-brand">
                <AlertCircle size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats Bar */}
      <div className="bg-card px-10 py-8 rounded-[2rem] border border-border/30 shadow-sm flex flex-wrap items-center justify-between gap-8">
        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
            Order ID
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-foreground">
              #ORD-{new Date(order.createdAt).getFullYear()}-
              {order.id.slice(-6).toUpperCase()}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
            Order Placed On
          </span>
          <div className="flex items-center gap-2.5">
            <Calendar size={16} className="text-muted-dark" />
            <span className="text-[13px] font-extrabold text-foreground">
              {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block">
            Total Income
          </span>
          <div className="flex items-center gap-1 text-2xl font-black text-primary">
            <IndianRupee size={20} strokeWidth={3} />
            {order.totalPrice.toLocaleString()}
          </div>
        </div>

        <Button
          onClick={() => setIsInvoiceOpen(true)}
          variant="outline"
          className="h-12 px-6 rounded-xl border-border/30 bg-card font-black text-[12px] text-foreground/80 flex items-center gap-2 hover:bg-muted-light shadow-sm"
        >
          View Invoice <FileText size={16} className="text-muted-dark" />
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details Section */}
          <OrderProductDetailsCard
            order={order}
            calculateDuration={calculateDuration}
          />

          {/* Customer Details Section */}
          <OrderCustomerDetailsCard order={order} />

          {/* Payment Details Section */}
          <OrderPaymentDetailsCard order={order} />
        </div>

        {/* Right Sidebar - Timeline & Actions */}
        <div className="space-y-6">
          {/* Order Timeline */}
          <OrderTimelineCard order={order} />

          {/* Order Actions */}
          <div className="bg-card p-10 rounded-[2rem] border border-border/30 shadow-sm space-y-6">
            <h3 className="text-[14px] font-black text-foreground mb-4 uppercase tracking-widest text-center lg:text-left">
              Order Actions
            </h3>
            <div className="flex flex-col gap-4">
              {order.status === 'pending' ? (
                <>
                  <Button
                    onClick={() => setPendingAction('confirm')}
                    disabled={updateStatus.isPending}
                    className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {updateStatus.isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-card border-t-transparent rounded-full animate-spin" />
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Accept & Confirm Request
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setPendingAction('reject')}
                    disabled={updateStatus.isPending}
                    variant="ghost"
                    className="h-14 rounded-2xl bg-card hover:bg-danger text-destructive border border-[#ef4444]/30 font-black text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <XCircle size={16} />
                    Reject Request
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4 bg-muted-light rounded-2xl border border-border/30">
                    <span className="text-xs font-black text-muted-foreground/85 uppercase tracking-widest block mb-1">
                      Request Handled
                    </span>
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-foreground/80">
                      {(order.status === 'confirmed' ||
                        order.status === 'active') && (
                        <span className="text-primary flex items-center gap-1">
                          <CheckCircle2 size={16} /> Confirmed
                        </span>
                      )}
                      {order.status === 'completed' && (
                        <span className="text-primary flex items-center gap-1">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      )}
                      {(order.status === 'cancelled' ||
                        order.status === 'rejected') && (
                        <span className="text-destructive flex items-center gap-1">
                          <XCircle size={16} /> Rejected / Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {(order.status === 'confirmed' ||
                    order.status === 'active') && (
                    <Button
                      onClick={() => setPendingAction('complete')}
                      disabled={updateStatus.isPending}
                      className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      Complete Rental (Returned)
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                className="h-14 rounded-2xl border border-border/30 font-black text-[12px] text-foreground flex items-center justify-center gap-3 hover:bg-muted-light transition-all shadow-sm"
              >
                <MessageSquare size={18} className="text-muted-dark" /> Contact
                Customer
              </Button>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-muted-dark font-black text-[11px] hover:bg-transparent flex items-center gap-2 tracking-[0.15em]"
              >
                <ArrowLeft size={14} className="text-muted-dark" /> BACK TO
                ORDERS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* High-Fidelity Alert Confirmation Dialog */}
      {/* High-Fidelity Alert Confirmation Dialog */}
      <ReusableAlertDialog
        isOpen={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        onConfirm={() => {
          if (pendingAction === 'confirm') {
            handleStatusUpdate('confirmed')
          } else if (pendingAction === 'reject') {
            handleStatusUpdate('rejected')
          } else if (pendingAction === 'complete') {
            handleStatusUpdate('completed')
          }
          setPendingAction(null)
        }}
        onCancel={() => setPendingAction(null)}
        title={getActionTitle()}
        description={getActionDescription()}
        confirmText={getActionConfirmText()}
        variant={getActionVariant()}
        isPending={updateStatus.isPending}
      />

      {/* Premium Printable Invoice Dialog */}
      <OrderInvoiceDialog
        isOpen={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        order={order}
        calculateDuration={calculateDuration}
      />
    </div>
  )
}
