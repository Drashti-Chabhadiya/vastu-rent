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
import { cn } from '#/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

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
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span
            className="cursor-pointer hover:text-dash-brand"
            onClick={onBack}
          >
            Dashboard
          </span>
          <ChevronRight size={10} className="text-slate-300" />
          <span
            className="cursor-pointer hover:text-dash-brand"
            onClick={onBack}
          >
            Orders
          </span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold">Order Details</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Order Details</h1>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-1.5 border-r border-slate-50">
              <Calendar size={14} className="text-dash-brand" />
              <span className="text-[11px] font-bold text-slate-600">
                {format(new Date(order.startDate), 'dd MMM')} -{' '}
                {format(new Date(order.endDate), 'dd MMM yyyy')}
              </span>
              <ChevronRight size={12} className="rotate-90 text-slate-300" />
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
      <div className="bg-white px-10 py-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-8">
        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Order ID
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-[#1e293b]">
              #ORD-{new Date(order.createdAt).getFullYear()}-
              {order.id.slice(-6).toUpperCase()}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Order Placed On
          </span>
          <div className="flex items-center gap-2.5">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-[13px] font-extrabold text-[#1e293b]">
              {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Total Income
          </span>
          <div className="flex items-center gap-1 text-2xl font-black text-[#059669]">
            <IndianRupee size={20} strokeWidth={3} />
            {order.totalPrice.toLocaleString()}
          </div>
        </div>

        <Button
          onClick={() => setIsInvoiceOpen(true)}
          variant="outline"
          className="h-12 px-6 rounded-xl border-slate-100 bg-white font-black text-[12px] text-slate-700 flex items-center gap-2 hover:bg-slate-50 shadow-sm"
        >
          View Invoice <FileText size={16} className="text-slate-400" />
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details Section */}
          <OrderProductDetailsCard order={order} calculateDuration={calculateDuration} />

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
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[14px] font-black text-[#1e293b] mb-4 uppercase tracking-widest text-center lg:text-left">
              Order Actions
            </h3>
            <div className="flex flex-col gap-4">
              {order.status === 'pending' ? (
                <>
                  <Button
                    onClick={() => setPendingAction('confirm')}
                    disabled={updateStatus.isPending}
                    className="h-14 rounded-2xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {updateStatus.isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    className="h-14 rounded-2xl bg-white hover:bg-red-50 text-[#ef4444] border border-[#ef4444]/30 font-black text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <XCircle size={16} />
                    Reject Request
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Request Handled
                    </span>
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-700">
                      {(order.status === 'confirmed' ||
                        order.status === 'active') && (
                          <span className="text-[#059669] flex items-center gap-1">
                            <CheckCircle2 size={16} /> Confirmed
                          </span>
                        )}
                      {order.status === 'completed' && (
                        <span className="text-[#059669] flex items-center gap-1">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      )}
                      {(order.status === 'cancelled' ||
                        order.status === 'rejected') && (
                          <span className="text-red-500 flex items-center gap-1">
                            <XCircle size={16} /> Rejected / Cancelled
                          </span>
                        )}
                    </div>
                  </div>

                  {(order.status === 'confirmed' || order.status === 'active') && (
                    <Button
                      onClick={() => setPendingAction('complete')}
                      disabled={updateStatus.isPending}
                      className="w-full h-14 rounded-2xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      Complete Rental (Returned)
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                className="h-14 rounded-2xl border border-slate-100 font-black text-[12px] text-[#1e293b] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
              >
                <MessageSquare size={18} className="text-slate-400" /> Contact
                Customer
              </Button>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-slate-400 font-black text-[11px] hover:bg-transparent flex items-center gap-2 tracking-[0.15em]"
              >
                <ArrowLeft size={14} className="text-slate-300" /> BACK TO
                ORDERS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* High-Fidelity Alert Confirmation Dialog */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem] border border-slate-100 p-10 max-w-md bg-white shadow-2xl font-sans">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-lg font-black text-[#1e293b] flex items-center gap-3">
              {pendingAction === 'complete' ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#e2f5ec] flex items-center justify-center text-[#059669]">
                    <CheckCircle2 size={20} />
                  </div>
                  <span>Complete Rental?</span>
                </div>
              ) : pendingAction === 'confirm' ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#e2f5ec] flex items-center justify-center text-[#059669]">
                    <CheckCircle2 size={20} />
                  </div>
                  <span>Confirm Booking?</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#ef4444]">
                    <XCircle size={20} />
                  </div>
                  <span>Reject Booking?</span>
                </div>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] font-semibold text-slate-500 leading-relaxed pt-2">
              {pendingAction === 'complete'
                ? `Are you sure you want to mark this rental booking for "${order.product?.title || 'this product'}" as Completed? The product will be marked as returned, and the renter will be allowed to submit a review.`
                : pendingAction === 'confirm'
                ? `Are you sure you want to accept this rental booking request for "${order.product?.title || 'this product'}"? The booking status will be updated to Confirmed, and the renter will receive a notification.`
                : `Are you sure you want to reject this rental booking request for "${order.product?.title || 'this product'}"? This request will be cancelled, and the renter will be notified.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4 mt-10 font-sans">
            <AlertDialogCancel className="h-14 flex-1 rounded-2xl border border-slate-100 font-black text-[12px] text-slate-500 hover:bg-slate-50 active:scale-95 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAction === 'confirm') {
                  handleStatusUpdate('confirmed')
                } else if (pendingAction === 'reject') {
                  handleStatusUpdate('rejected')
                } else if (pendingAction === 'complete') {
                  handleStatusUpdate('completed')
                }
                setPendingAction(null)
              }}
              className={cn(
                'h-14 flex-1 rounded-2xl font-black text-[12px] text-white active:scale-95 transition-all',
                pendingAction === 'confirm' || pendingAction === 'complete'
                  ? 'bg-[#059669] hover:bg-[#059669]/90 shadow-lg shadow-emerald-100'
                  : 'bg-[#ef4444] hover:bg-[#ef4444]/90 shadow-lg shadow-red-100',
              )}
            >
              {pendingAction === 'complete'
                ? 'Complete Rental'
                : pendingAction === 'confirm'
                ? 'Confirm Booking'
                : 'Reject Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
