import { useState } from 'react'
import {
  User as UserIcon,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'
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
import { cn } from '#/lib/utils'

interface DetailedBookingDialogProps {
  order: any
  onClose: () => void
  onStatusUpdate: (id: string, newStatus: string) => void
  isPendingStatusUpdate: boolean
}

export const DetailedBookingDialog = ({
  order,
  onClose,
  onStatusUpdate,
  isPendingStatusUpdate,
}: DetailedBookingDialogProps) => {
  const [pendingAction, setPendingAction] = useState<
    'confirm' | 'reject' | null
  >(null)

  if (!order) return null

  // Duration Calculator helper
  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
    return diff || 1
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <CheckCircle2 size={10} /> Confirmed
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <CheckCircle2 size={10} /> Completed
          </Badge>
        )
      case 'rejected':
      case 'cancelled':
        return (
          <Badge className="bg-red-50 text-red-600 border-none px-2.5 py-0.5 rounded-md font-black flex items-center gap-1.5">
            <XCircle size={10} /> Cancelled
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
    <>
      <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl p-0 border-none bg-slate-50 rounded-[2.5rem] shadow-2xl font-sans overflow-hidden">
          {/* Top Product Banner card */}
          <div className="relative h-44 bg-slate-900">
            {order.product?.images?.[0] && (
              <img
                src={order.product.images[0]}
                alt=""
                className="w-full h-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50/95 px-2 py-0.5 rounded">
                {order.product?.category?.name || 'Item'}
              </span>
              <h3 className="text-xl font-extrabold text-white leading-tight font-display mt-2">
                {order.product?.title}
              </h3>
            </div>
          </div>

          {/* Core Details body */}
          <div className="p-8 space-y-6">
            {/* Top details columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                  Customer Info
                </span>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserIcon size={12} className="text-slate-400" />
                  <span>{order.renter?.name}</span>
                </div>
                <span
                  className="text-[10px] font-medium text-slate-400 block truncate"
                  title={order.renter?.email}
                >
                  {order.renter?.email}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                  Status & Method
                </span>
                <div className="flex gap-1.5 items-center">
                  {getStatusBadge(order.status)}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-tight pt-1">
                  Via {order.paymentMethod === 'cash' ? 'Cash / CoD' : 'Online'}
                </span>
              </div>
            </div>

            {/* Booking dates and rental duration info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                Reserved Duration
              </span>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase">
                    From
                  </span>
                  <span>
                    {format(new Date(order.startDate), 'dd MMM yyyy')}
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-300 mt-2" />
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-slate-400 uppercase">
                    To
                  </span>
                  <span>{format(new Date(order.endDate), 'dd MMM yyyy')}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Total Rental Period</span>
                <span className="text-[#059669] font-black">
                  {calculateDuration(order.startDate, order.endDate)} Days
                </span>
              </div>
            </div>

            {/* Earnings info and pricing breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Daily rate</span>
                <span className="text-slate-800 font-bold">
                  ₹{(order.product?.price || order.totalPrice).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Security deposit</span>
                <span className="text-slate-800 font-bold">
                  ₹{(order.depositAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[13px] font-black text-[#059669] border-t border-slate-100 pt-2">
                <span>Total Earnings</span>
                <span>₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons (Confirm / Reject requests if pending) */}
            {order.status === 'pending' ? (
              <div className="flex gap-4 pt-2">
                <Button
                  onClick={() => setPendingAction('confirm')}
                  className="flex-1 h-12 rounded-xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[11px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  disabled={isPendingStatusUpdate}
                >
                  <CheckCircle2 size={14} /> Confirm Booking
                </Button>
                <Button
                  onClick={() => setPendingAction('reject')}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl bg-white hover:bg-red-50 text-[#ef4444] border border-[#ef4444]/30 font-black text-[11px] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  disabled={isPendingStatusUpdate}
                >
                  <XCircle size={14} /> Reject Request
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-100/50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Request already processed
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* RADIX CONFIRMATION PROMPTS */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="max-w-md p-8 border-none bg-white rounded-[2rem] shadow-2xl font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black text-slate-800 flex items-center gap-3">
              {pendingAction === 'confirm' ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#059669]">
                    <CheckCircle2 size={20} />
                  </div>
                  <span>Confirm Booking?</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#ef4444]">
                    <XCircle size={20} />
                  </div>
                  <span>Reject Booking Request?</span>
                </div>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] font-semibold text-slate-500 leading-relaxed pt-2">
              {pendingAction === 'confirm'
                ? `Are you sure you want to accept this rental booking request for "${order.product?.title || 'this item'}"? The dates will be reserved in your calendar, and the renter will receive a notification.`
                : `Are you sure you want to reject this rental booking request for "${order.product?.title || 'this item'}"? The dates will remain available, and the renter will be notified.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4 mt-8">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border border-slate-100 font-black text-[11px] text-slate-500 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAction === 'confirm') {
                  onStatusUpdate(order.id, 'confirmed')
                } else if (pendingAction === 'reject') {
                  onStatusUpdate(order.id, 'rejected')
                }
                setPendingAction(null)
                onClose()
              }}
              className={cn(
                'h-12 flex-1 rounded-xl font-black text-[11px] text-white active:scale-95 transition-all cursor-pointer',
                pendingAction === 'confirm'
                  ? 'bg-[#059669] hover:bg-[#059669]/90 shadow-lg shadow-emerald-100'
                  : 'bg-[#ef4444] hover:bg-[#ef4444]/90 shadow-lg shadow-red-100',
              )}
            >
              {pendingAction === 'confirm'
                ? 'Confirm Booking'
                : 'Reject Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
