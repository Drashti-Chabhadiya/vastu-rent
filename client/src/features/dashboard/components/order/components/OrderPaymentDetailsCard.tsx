import { format } from 'date-fns'
import { cn } from '#/lib/utils'

interface OrderPaymentDetailsCardProps {
  order: any
}

export const OrderPaymentDetailsCard = ({
  order,
}: OrderPaymentDetailsCardProps) => {
  if (!order) return null

  const paymentItems = [
    {
      label: 'Payment Method',
      value:
        order.paymentMethod === 'cash'
          ? 'Cash / CoD Payment'
          : 'Online Payment (Razorpay)',
    },
    {
      label: 'Payment Status',
      value: (order.paymentStatus || 'Pending').toUpperCase(),
      isBadge: true,
    },
    {
      label: 'Transaction ID',
      value:
        order.transactionId ||
        (order.paymentMethod === 'cash'
          ? 'N/A (Cash on Delivery)'
          : 'Pending Check'),
    },
    {
      label: 'Payment Date',
      value: format(
        new Date(order.updatedAt || order.createdAt),
        'dd MMM yyyy, hh:mm a',
      ),
    },
    {
      label: 'Rental Subtotal',
      value: `₹${(order.rentalFee || order.totalPrice).toLocaleString()}`,
    },
    {
      label: 'Security Deposit',
      value: `₹${(order.depositAmount || 0).toLocaleString()}`,
    },
  ]

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-10 pb-2">
        <h3 className="text-[14px] font-black text-[#1e293b] mb-8 uppercase tracking-widest">
          Payment Details
        </h3>
      </div>
      <div className="px-10 space-y-0">
        {paymentItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-4 border-b border-slate-50"
          >
            <span className="text-[12px] font-bold text-slate-500">
              {item.label}
            </span>
            {item.isBadge ? (
              <span
                className={cn(
                  'text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full',
                  item.value === 'PAID'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-[#fffbeb] text-[#d97706]',
                )}
              >
                {item.value}
              </span>
            ) : (
              <span className="text-[12px] font-black text-[#1e293b]">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="bg-[#f8fafc] px-10 py-8 flex items-center justify-between mt-4">
        <span className="text-[14px] font-black text-[#1e293b]">
          Total Paid (Gross Income)
        </span>
        <span className="text-xl font-black text-[#059669]">
          ₹{order.totalPrice.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
