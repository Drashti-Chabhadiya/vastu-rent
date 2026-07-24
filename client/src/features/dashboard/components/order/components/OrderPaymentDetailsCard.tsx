import { format } from 'date-fns'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'

interface OrderPaymentDetailsCardProps {
  order: any
}

export const OrderPaymentDetailsCard = ({
  order,
}: OrderPaymentDetailsCardProps) => {
  const { t } = useTranslation()
  if (!order) return null

  const paymentItems = [
    {
      label: t('Payment Method'),
      value:
        order.paymentMethod === 'cash'
          ? t('Cash / CoD Payment')
          : t('Online Payment'),
    },
    {
      label: t('Payment Status'),
      value: (order.paymentStatus || t('Pending')).toUpperCase(),
      isBadge: true,
    },
    {
      label: t('Transaction ID'),
      value:
        order.transactionId ||
        (order.paymentMethod === 'cash'
          ? t('N/A (Cash on Delivery)')
          : t('Pending Check')),
    },
    {
      label: t('Payment Date'),
      value: format(
        new Date(order.updatedAt || order.createdAt),
        'dd MMM yyyy, hh:mm a',
      ),
    },
    {
      label: t('Rental Subtotal'),
      value: `₹${(order.rentalFee || order.totalPrice).toLocaleString()}`,
    },
    {
      label: t('Security Deposit'),
      value: `₹${(order.depositAmount || 0).toLocaleString()}`,
    },
  ]

  return (
    <div className="bg-card rounded-[2rem] border border-border/30 shadow-sm overflow-hidden">
      <div className="p-10 pb-2">
        <h3 className="text-[14px] font-black text-foreground mb-8 uppercase tracking-widest">
          {t('Payment Details')}
        </h3>
      </div>
      <div className="px-10 space-y-0">
        {paymentItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-4 border-b border-border/30"
          >
            <span className="text-[12px] font-bold text-muted-foreground/85">
              {item.label}
            </span>
            {item.isBadge ? (
              <span
                className={cn(
                  'text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full',
                  item.value === 'PAID'
                    ? 'bg-primary-soft text-primary'
                    : 'bg-warning text-warning-foreground',
                )}
              >
                {item.value}
              </span>
            ) : (
              <span className="text-[12px] font-black text-foreground">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="bg-muted-light px-10 py-8 flex items-center justify-between mt-4">
        <span className="text-[14px] font-black text-foreground">
          {t('Total Paid (Gross Income)')}
        </span>
        <span className="text-xl font-black text-primary">
          ₹{order.totalPrice.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
