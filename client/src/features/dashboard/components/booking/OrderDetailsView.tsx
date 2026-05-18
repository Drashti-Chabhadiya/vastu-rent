import { useState } from 'react';
import { 
  ArrowLeft, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Calendar,
  ChevronRight,
  User as UserIcon,
  MessageSquare,
  FileText,
  MapPin,
  Printer,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { useUpdateRentalStatus } from '#/hook';
import { toast } from 'sonner';
import { cn } from '#/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
} from '#/components/ui/dialog';

interface OrderDetailsViewProps {
  order: any;
  onBack: () => void;
}

export const OrderDetailsView = ({ order, onBack }: OrderDetailsViewProps) => {
  const updateStatus = useUpdateRentalStatus();
  const [pendingAction, setPendingAction] = useState<'confirm' | 'reject' | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (!order) return null;

  const handleStatusUpdate = (newStatus: string) => {
    updateStatus.mutate(
      { id: order.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${newStatus}`);
        },
        onError: () => {
          toast.error("Failed to update status");
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-[#e2f5ec] text-[#059669] border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5"><CheckCircle2 size={12} /> Confirmed</Badge>;
      case 'active':
        return <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5"><Clock size={12} /> Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-50 text-green-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5"><CheckCircle2 size={12} /> Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5"><XCircle size={12} /> Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-50 text-red-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5"><XCircle size={12} /> Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-50 text-yellow-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5"><AlertCircle size={12} /> Pending</Badge>;
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff || 1;
  };

  const getTimelineSteps = () => {
    const steps = [
      {
        title: "Order Placed",
        description: "Order has been placed by customer.",
        date: order.createdAt,
        status: "completed",
        icon: CheckCircle2,
        color: "bg-[#059669]"
      },
      {
        title: (order.status === "cancelled" || order.status === "rejected") ? "Rejected / Cancelled" : "Confirmed",
        description: (order.status === "cancelled" || order.status === "rejected")
          ? "This booking request was rejected." 
          : (order.status === "confirmed" || order.status === "active" || order.status === "completed")
            ? "Booking confirmed and active."
            : "Waiting for owner approval & confirmation.",
        date: (order.status === "confirmed" || order.status === "active" || order.status === "completed" || order.status === "cancelled" || order.status === "rejected") 
          ? order.updatedAt || order.createdAt 
          : null,
        status: (order.status === "confirmed" || order.status === "active" || order.status === "completed" || order.status === "cancelled" || order.status === "rejected")
          ? "completed"
          : "pending",
        icon: (order.status === "cancelled" || order.status === "rejected") ? XCircle : CheckCircle2,
        color: (order.status === "cancelled" || order.status === "rejected") 
          ? "bg-red-500" 
          : (order.status === "confirmed" || order.status === "active" || order.status === "completed") 
            ? "bg-[#059669]" 
            : "bg-[#f59e0b]"
      },
      {
        title: "Completed",
        description: "Rental period has ended and product was returned.",
        date: order.status === "completed" ? order.updatedAt || order.createdAt : null,
        status: order.status === "completed" ? "completed" : "upcoming",
        icon: CheckCircle2,
        color: order.status === "completed" ? "bg-[#059669]" : "bg-slate-100"
      }
    ];
    return steps;
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#f8fafc] -m-8 p-10 min-h-screen font-sans">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span className="cursor-pointer hover:text-dash-brand" onClick={onBack}>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="cursor-pointer hover:text-dash-brand" onClick={onBack}>Orders</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold">Order Details</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Order Details</h1>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 px-4 py-1.5 border-r border-slate-50">
               <Calendar size={14} className="text-dash-brand" />
               <span className="text-[11px] font-bold text-slate-600">
                 {format(new Date(order.startDate), 'dd MMM')} - {format(new Date(order.endDate), 'dd MMM yyyy')}
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
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Order ID</span>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-[#1e293b]">#ORD-{new Date(order.createdAt).getFullYear()}-{order.id.slice(-6).toUpperCase()}</h2>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Order Placed On</span>
          <div className="flex items-center gap-2.5">
             <Calendar size={16} className="text-slate-400" />
             <span className="text-[13px] font-extrabold text-[#1e293b]">
               {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
             </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Income</span>
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
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[14px] font-black text-[#1e293b] mb-8">Product Details</h3>
            <div className="flex gap-8">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-sm border border-slate-50">
                <img src={order.product?.images?.[0]} className="w-full h-full object-cover" alt={order.product?.title} />
              </div>
              <div className="flex-1 flex flex-col justify-center gap-1.5">
                <div className="flex items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-[#e2f5ec] px-3 py-1 rounded-lg">
                    {order.product?.category?.name || 'HOME DECOR'}
                  </span>
                </div>
                <h4 className="text-xl font-black text-[#1e293b]">{order.product?.title}</h4>
                <div className="flex items-center gap-0.5 text-[#059669] font-black text-lg">
                  <IndianRupee size={16} strokeWidth={3} />
                  {order.product?.price.toLocaleString()}
                  <span className="text-slate-400 text-[11px] font-bold ml-1">/ day</span>
                </div>
              </div>
              <div className="flex flex-col justify-center items-end gap-1.5">
                <span className="text-[9px] font-black text-[#334155] uppercase tracking-widest">Rental Period</span>
                <span className="text-[14px] font-black text-[#1e293b]">
                  {format(new Date(order.startDate), 'dd MMM yyyy')} - {format(new Date(order.endDate), 'dd MMM yyyy')}
                </span>
                <Badge className="bg-[#f1f5f9] text-[#475569] border-none px-4 py-1 rounded-full font-bold text-[11px]">
                  {calculateDuration(order.startDate, order.endDate)} Days
                </Badge>
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[14px] font-black text-[#1e293b] mb-8">Customer Details</h3>
            <div className="grid grid-cols-2 gap-20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-[#e2f5ec] flex items-center justify-center text-[#059669]">
                  <UserIcon size={24} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[16px] font-black text-[#1e293b] leading-tight">{order.renter?.name}</p>
                  <p className="text-[12px] font-bold text-slate-500">{order.renter?.email}</p>
                  <p className="text-[12px] font-bold text-slate-500">+91 {order.renter?.phone || '98765 43210'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black text-[#334155] uppercase tracking-widest block">Pickup & Location Details</span>
                <div className="text-[12px] font-bold text-slate-600 leading-relaxed space-y-1">
                  <p className="font-black text-[#1e293b] flex items-center gap-1.5 text-xs">
                    <MapPin size={12} className="text-dash-brand" /> Primary Location:
                  </p>
                  <p>{order.product?.location || 'Self-Pickup'}</p>
                  {order.product?.pickupReturnDetails && (
                    <>
                      <p className="font-black text-[#1e293b] flex items-center gap-1.5 text-xs pt-1.5">
                        Pickup Directions:
                      </p>
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                        {order.product.pickupReturnDetails}
                      </p>
                    </>
                  )}
                  {order.product?.deliveryOptions && order.product.deliveryOptions.length > 0 && (
                    <>
                      <p className="font-black text-[#1e293b] flex items-center gap-1.5 text-xs pt-1.5">
                        Fulfillment Modes:
                      </p>
                      <p className="text-slate-500 text-[11px] font-medium">
                        {order.product.deliveryOptions.join(', ')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 pb-2">
               <h3 className="text-[14px] font-black text-[#1e293b] mb-8 uppercase tracking-widest">Payment Details</h3>
            </div>
            <div className="px-10 space-y-0">
              {[
                { 
                  label: 'Payment Method', 
                  value: order.paymentMethod === 'cash' ? 'Cash / CoD Payment' : 'Online Payment (Razorpay)' 
                },
                { 
                  label: 'Payment Status', 
                  value: (order.paymentStatus || 'Pending').toUpperCase(), 
                  isBadge: true 
                },
                { 
                  label: 'Transaction ID', 
                  value: order.transactionId || (order.paymentMethod === 'cash' ? 'N/A (Cash on Delivery)' : 'Pending Check') 
                },
                { 
                  label: 'Payment Date', 
                  value: format(new Date(order.updatedAt || order.createdAt), 'dd MMM yyyy, hh:mm a') 
                },
                { 
                  label: 'Rental Subtotal', 
                  value: `₹${(order.rentalFee || order.totalPrice).toLocaleString()}` 
                },
                { 
                  label: 'Security Deposit', 
                  value: `₹${(order.depositAmount || 0).toLocaleString()}` 
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50">
                  <span className="text-[12px] font-bold text-slate-500">{item.label}</span>
                  {item.isBadge ? (
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full",
                      item.value === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-[#fffbeb] text-[#d97706]'
                    )}>
                      {item.value}
                    </span>
                  ) : (
                    <span className="text-[12px] font-black text-[#1e293b]">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-[#f8fafc] px-10 py-8 flex items-center justify-between mt-4">
              <span className="text-[14px] font-black text-[#1e293b]">Total Paid (Gross Income)</span>
              <span className="text-xl font-black text-[#059669]">₹{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Timeline & Actions */}
        <div className="space-y-6">
          {/* Order Timeline */}
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[14px] font-black text-[#1e293b] mb-10 uppercase tracking-widest">Order Timeline</h3>
            <div className="relative space-y-12 pl-12">
              {/* Timeline Dashed Line */}
              <div className="absolute left-5 top-2 bottom-2 w-0 border-l border-dashed border-slate-200"></div>

              {getTimelineSteps().map((step, i) => {
                const Icon = step.icon;
                const isUpcoming = step.status === "upcoming";
                const isPending = step.status === "pending";
                
                return (
                  <div key={i} className={cn("relative", isUpcoming && "opacity-30")}>
                    <div className={cn(
                      "absolute -left-12 w-10 h-10 rounded-full flex items-center justify-center text-white z-10 shadow-lg",
                      step.color,
                      isUpcoming && "border border-slate-100 text-slate-300 shadow-none bg-slate-50",
                      isPending && "shadow-amber-100"
                    )}>
                      <Icon size={18} className={isUpcoming ? "text-slate-300" : "text-white"} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[14px] font-black text-[#1e293b]">{step.title}</p>
                      {step.date ? (
                        <p className="text-[11px] font-bold text-slate-400">
                          {format(new Date(step.date), 'dd MMM yyyy, hh:mm a')}
                        </p>
                      ) : (
                        <p className="text-[11px] font-bold text-slate-400">
                          {isUpcoming ? 'Upcoming Stage' : 'Pending Approval'}
                        </p>
                      )}
                      <p className="text-[11px] font-medium text-slate-500">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[14px] font-black text-[#1e293b] mb-4 uppercase tracking-widest text-center lg:text-left">Order Actions</h3>
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
                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Request Handled
                  </span>
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-700">
                    {(order.status === 'confirmed' || order.status === 'active') && (
                      <span className="text-[#059669] flex items-center gap-1"><CheckCircle2 size={16} /> Confirmed</span>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-[#059669] flex items-center gap-1"><CheckCircle2 size={16} /> Completed</span>
                    )}
                    {(order.status === 'cancelled' || order.status === 'rejected') && (
                      <span className="text-red-500 flex items-center gap-1"><XCircle size={16} /> Rejected / Cancelled</span>
                    )}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline"
                className="h-14 rounded-2xl border border-slate-100 font-black text-[12px] text-[#1e293b] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
              >
                <MessageSquare size={18} className="text-slate-400" /> Contact Customer
              </Button>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={onBack}
                variant="ghost" 
                className="text-slate-400 font-black text-[11px] hover:bg-transparent flex items-center gap-2 tracking-[0.15em]"
              >
                <ArrowLeft size={14} className="text-slate-300" /> BACK TO ORDERS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* High-Fidelity Alert Confirmation Dialog */}
      <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border border-slate-100 p-10 max-w-md bg-white shadow-2xl font-sans">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-lg font-black text-[#1e293b] flex items-center gap-3">
              {pendingAction === 'confirm' ? (
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
              {pendingAction === 'confirm' 
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
                  handleStatusUpdate('confirmed');
                } else if (pendingAction === 'reject') {
                  handleStatusUpdate('rejected');
                }
                setPendingAction(null);
              }}
              className={cn(
                "h-14 flex-1 rounded-2xl font-black text-[12px] text-white active:scale-95 transition-all",
                pendingAction === 'confirm' 
                  ? "bg-[#059669] hover:bg-[#059669]/90 shadow-lg shadow-emerald-100" 
                  : "bg-[#ef4444] hover:bg-[#ef4444]/90 shadow-lg shadow-red-100"
              )}
            >
              {pendingAction === 'confirm' ? 'Confirm Booking' : 'Reject Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Premium Printable Invoice Dialog */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-50 rounded-[2rem] shadow-2xl font-sans">
          {/* Header Toolbar */}
          <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100 rounded-t-[2rem] sticky top-0 z-10 no-print">
            <div className="flex items-center gap-2">
              <FileText className="text-dash-brand" size={20} />
              <span className="text-[14px] font-black text-slate-800 uppercase tracking-wider">Invoice details</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => window.print()}
                variant="outline" 
                className="h-10 px-4 rounded-xl border-slate-100 bg-white font-black text-[11px] text-slate-700 flex items-center gap-2 hover:bg-slate-50 shadow-sm"
              >
                <Printer size={14} className="text-slate-500" /> Print
              </Button>
              <Button 
                onClick={() => window.print()}
                className="h-10 px-4 rounded-xl bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[11px] flex items-center gap-2 shadow-sm"
              >
                <Download size={14} /> Download PDF
              </Button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="p-10 print-invoice-content bg-white m-6 rounded-3xl border border-slate-100 shadow-sm space-y-10" id="vastu-rental-invoice">
            {/* Branding & Invoice Metadata */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#059669] font-black text-2xl tracking-widest font-display">
                  <span>VASTU</span>
                  <span className="text-slate-400 font-light">RENT</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Live in Harmony</span>
              </div>
              <div className="text-left md:text-right space-y-1">
                <h2 className="text-lg font-black text-slate-800 font-display">INVOICE</h2>
                <div className="text-xs font-bold text-slate-400 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3">
                  <span>Invoice ID: <strong className="text-slate-700">INV-{new Date(order.createdAt).getFullYear()}-{order.id.slice(-6).toUpperCase()}</strong></span>
                  <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span>Booking ID: <strong className="text-slate-700">ORD-{new Date(order.createdAt).getFullYear()}-{order.id.slice(-6).toUpperCase()}</strong></span>
                </div>
              </div>
            </div>

            {/* Billed To / From */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-3 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Billed To (Customer)</span>
                <div className="space-y-1 font-semibold text-slate-700">
                  <div className="text-[14px] font-black text-slate-800">{order.renter?.name}</div>
                  <div>Email: {order.renter?.email}</div>
                  <div>Phone: {order.renter?.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="space-y-3 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Billed By (Owner)</span>
                <div className="space-y-1 font-semibold text-slate-700">
                  <div className="text-[14px] font-black text-slate-800">{order.product?.owner?.name || 'Vastu Lister'}</div>
                  <div>Email: {order.product?.owner?.email || 'N/A'}</div>
                  <div>Phone: {order.product?.owner?.phone || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Dates & Payments Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issue Date</span>
                <span className="font-bold text-slate-700">{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rental Period</span>
                <span className="font-bold text-slate-700 flex flex-col">
                  <span>{format(new Date(order.startDate), 'dd MMM yyyy')}</span>
                  <span className="text-[10px] text-slate-400 font-medium">to {format(new Date(order.endDate), 'dd MMM yyyy')}</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Method</span>
                <span className="font-bold text-slate-700 uppercase">{order.paymentMethod === 'cash' ? 'Cash / CoD' : order.paymentMethod || 'Online'}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Status</span>
                <span className={cn(
                  "inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                  order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                )}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            {/* Product Item Details Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Product / Item</th>
                    <th className="p-4 text-center">Rental Rate</th>
                    <th className="p-4 text-center">Duration</th>
                    <th className="p-4 pr-6 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr>
                    <td className="p-4 pl-6 flex items-center gap-4">
                      {order.product?.images?.[0] && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm hidden sm:block">
                          <img src={order.product?.images[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                      )}
                      <div>
                        <div className="text-[13px] font-black text-slate-800">{order.product?.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Category: {order.product?.category?.name || 'General'}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">₹{(order.product?.price || order.totalPrice).toLocaleString()} / day</td>
                    <td className="p-4 text-center">{calculateDuration(order.startDate, order.endDate)} Days</td>
                    <td className="p-4 pr-6 text-right font-black text-slate-800">
                      ₹{((order.product?.price || order.totalPrice) * calculateDuration(order.startDate, order.endDate)).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Summary Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
              <div className="w-full md:max-w-md space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Transaction Details</span>
                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                  <div>Transaction ID: <span className="text-slate-800 font-bold">{order.transactionId || 'N/A'}</span></div>
                  <div>Booking Status: <span className="text-slate-800 font-bold uppercase">{order.status}</span></div>
                  <div className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                    Terms: Payment terms are strictly set per client agreement. Products must be returned in original listing condition.
                  </div>
                </div>
              </div>

              <div className="w-full md:max-w-xs space-y-3 font-semibold text-xs text-slate-600">
                <div className="flex justify-between p-2">
                  <span>Rental Subtotal</span>
                  <span className="text-slate-800 font-bold">₹{((order.product?.price || order.totalPrice) * calculateDuration(order.startDate, order.endDate)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span>Taxes & Fees (0%)</span>
                  <span className="text-slate-800 font-bold">₹0</span>
                </div>
                <div className="flex justify-between p-2">
                  <span>Security Deposit</span>
                  <span className="text-slate-800 font-bold">₹{(order.depositAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-[14px] text-[#059669] font-black mt-2">
                  <span>Total Amount</span>
                  <span>₹{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
