import { FileText, Printer, Download } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { cn } from '#/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

interface OrderInvoiceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  order: any
  calculateDuration: (start: string, end: string) => number
}

export const OrderInvoiceDialog = ({
  isOpen,
  onOpenChange,
  order,
  calculateDuration,
}: OrderInvoiceDialogProps) => {
  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-muted-light rounded-[2rem] shadow-2xl font-sans">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between p-6 bg-card border-b border-border/30 rounded-t-[2rem] sticky top-0 z-10 no-print">
          <div className="flex items-center gap-2">
            <FileText className="text-dash-brand" size={20} />
            <span className="text-[14px] font-black text-foreground/90 uppercase tracking-wider">
              Invoice details
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => window.print()}
              variant="outline"
              className="h-10 px-4 rounded-xl border-border/30 bg-card font-black text-[11px] text-foreground/80 flex items-center gap-2 hover:bg-muted-light shadow-sm"
            >
              <Printer size={14} className="text-muted-foreground/85" /> Print
            </Button>
            <Button
              type="button"
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[11px] flex items-center gap-2 shadow-sm"
            >
              <Download size={14} /> Download PDF
            </Button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          className="p-10 print-invoice-content bg-card m-6 rounded-3xl border border-border/30 shadow-sm space-y-10"
          id="vastu-rental-invoice"
        >
          {/* Branding & Invoice Metadata */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/30 pb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-black text-2xl tracking-widest font-display">
                <span>VASTU</span>
                <span className="text-muted-dark font-light">RENT</span>
              </div>
              <span className="text-[9px] font-bold text-muted-dark uppercase tracking-widest block">
                Live in Harmony
              </span>
            </div>
            <div className="text-left md:text-right space-y-1">
              <h2 className="text-lg font-black text-foreground/90 font-display">
                INVOICE
              </h2>
              <div className="text-xs font-bold text-muted-dark flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3">
                <span>
                  Invoice ID:{' '}
                  <strong className="text-foreground/80">
                    INV-{new Date(order.createdAt).getFullYear()}-
                    {order.id.slice(-6).toUpperCase()}
                  </strong>
                </span>
                <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-muted-dark/20"></span>
                <span>
                  Booking ID:{' '}
                  <strong className="text-foreground/80">
                    ORD-{new Date(order.createdAt).getFullYear()}-
                    {order.id.slice(-6).toUpperCase()}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / From */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="space-y-3 p-6 bg-muted-light/50 rounded-2xl border border-border/30">
              <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                Billed To (Customer)
              </span>
              <div className="space-y-1 font-semibold text-foreground/80">
                <div className="text-[14px] font-black text-foreground/90">
                  {order.renter?.name}
                </div>
                <div>Email: {order.renter?.email}</div>
                <div>Phone: {order.renter?.phone || 'N/A'}</div>
              </div>
            </div>

            <div className="space-y-3 p-6 bg-muted-light/50 rounded-2xl border border-border/30">
              <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                Billed By (Provider)
              </span>
              <div className="space-y-1 font-semibold text-foreground/80">
                <div className="text-[14px] font-black text-foreground/90">
                  {order.product?.user?.name || 'Vastu Lister'}
                </div>
                <div>Email: {order.product?.user?.email || 'N/A'}</div>
                <div>Phone: {order.product?.user?.phone || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Dates & Payments Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted-light p-6 rounded-2xl border border-border/30 text-xs">
            <div>
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                Issue Date
              </span>
              <span className="font-bold text-foreground/80">
                {format(new Date(order.createdAt), 'dd MMM yyyy')}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                Rental Period
              </span>
              <span className="font-bold text-foreground/80 flex flex-col">
                <span>{format(new Date(order.startDate), 'dd MMM yyyy')}</span>
                <span className="text-[10px] text-muted-dark font-medium">
                  to {format(new Date(order.endDate), 'dd MMM yyyy')}
                </span>
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                Payment Method
              </span>
              <span className="font-bold text-foreground/80 uppercase">
                {order.paymentMethod === 'cash'
                  ? 'Cash / CoD'
                  : order.paymentMethod || 'Online'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                Payment Status
              </span>
              <span
                className={cn(
                  'inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider',
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-warning text-warning-foreground',
                )}
              >
                {order.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>

          <div className="border border-border/30 rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted-light border-b border-border/30 font-black text-muted-foreground/85 uppercase tracking-wider hover:bg-transparent">
                  <TableHead className="p-4 pl-6 h-auto">
                    Product / Item
                  </TableHead>
                  <TableHead className="p-4 text-center h-auto">
                    Rental Rate
                  </TableHead>
                  <TableHead className="p-4 text-center h-auto">
                    Duration
                  </TableHead>
                  <TableHead className="p-4 pr-6 text-right h-auto">
                    Subtotal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/50 font-semibold text-foreground/80">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell className="p-4 pl-6 flex items-center gap-4">
                    {order.product?.images?.[0] && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/30 shadow-sm hidden sm:block">
                        <img
                          src={order.product?.images[0]}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-[13px] font-black text-foreground/90">
                        {order.product?.title}
                      </div>
                      <div className="text-[10px] text-muted-dark font-medium">
                        Category: {order.product?.category?.name || 'General'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    ₹
                    {(
                      order.product?.price || order.totalPrice
                    ).toLocaleString()}{' '}
                    / day
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    {calculateDuration(order.startDate, order.endDate)} Days
                  </TableCell>
                  <TableCell className="p-4 pr-6 text-right font-black text-foreground/90">
                    ₹
                    {(
                      (order.product?.price || order.totalPrice) *
                      calculateDuration(order.startDate, order.endDate)
                    ).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Calculations & Summary Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
            <div className="w-full md:max-w-md space-y-3">
              <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                Transaction Details
              </span>
              <div className="p-5 bg-muted-light/50 rounded-2xl border border-border/30 space-y-2 text-xs font-semibold text-muted-foreground">
                <div>
                  Transaction ID:{' '}
                  <span className="text-foreground/90 font-bold">
                    {order.transactionId || 'N/A'}
                  </span>
                </div>
                <div>
                  Booking Status:{' '}
                  <span className="text-foreground/90 font-bold uppercase">
                    {order.status}
                  </span>
                </div>
                <div className="text-[10px] text-muted-dark pt-1 leading-relaxed">
                  Terms: Payment terms are strictly set per client agreement.
                  Products must be returned in original listing condition.
                </div>
              </div>
            </div>

            <div className="w-full md:max-w-xs space-y-3 font-semibold text-xs text-muted-foreground">
              <div className="flex justify-between p-2">
                <span>Rental Subtotal</span>
                <span className="text-foreground/90 font-bold">
                  ₹
                  {(
                    (order.product?.price || order.totalPrice) *
                    calculateDuration(order.startDate, order.endDate)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2">
                <span>Taxes & Fees (0%)</span>
                <span className="text-foreground/90 font-bold">₹0</span>
              </div>
              <div className="flex justify-between p-2">
                <span>Security Deposit</span>
                <span className="text-foreground/90 font-bold">
                  ₹{(order.depositAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted-light rounded-xl border border-border/30 text-[14px] text-primary font-black mt-2">
                <span>Total Amount</span>
                <span>₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
