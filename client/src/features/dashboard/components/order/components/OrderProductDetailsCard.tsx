import { IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { useTranslation } from '#/context/TranslationContext'

interface OrderProductDetailsCardProps {
  order: any
  calculateDuration: (start: string, end: string) => number
}

export const OrderProductDetailsCard = ({
  order,
  calculateDuration,
}: OrderProductDetailsCardProps) => {
  const { t } = useTranslation()
  return (
    <div className="bg-card p-10 rounded-[2rem] border border-border/30 shadow-sm">
      <h3 className="text-[14px] font-black text-foreground mb-8">
        {t('Product Details')}
      </h3>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-sm border border-border/30 shrink-0 mx-auto sm:mx-0">
          <img
            src={order.product?.images?.[0]}
            className="w-full h-full object-cover"
            alt={order.product?.title}
          />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <div className="flex items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary-soft px-3 py-1 rounded-lg">
              {order.product?.category?.name || t('HOME DECOR')}
            </span>
          </div>
          <h4 className="text-xl font-black text-foreground">
            {order.product?.title}
          </h4>
          <div className="flex items-center gap-0.5 text-primary font-black text-lg">
            <IndianRupee size={16} strokeWidth={3} />
            {order.product?.price.toLocaleString()}
            <span className="text-muted-dark text-[11px] font-bold ml-1">
              {t('/ day')}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-start sm:items-end gap-1.5 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/30 w-full sm:w-auto">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            {t('Rental Period')}
          </span>
          <span className="text-[14px] font-black text-foreground">
            {format(new Date(order.startDate), 'dd MMM yyyy')} -{' '}
            {format(new Date(order.endDate), 'dd MMM yyyy')}
          </span>
          <Badge className="bg-muted text-muted-foreground border-none px-4 py-1 rounded-full font-bold text-[11px]">
            {t('{duration} Days').replace(
              '{duration}',
              calculateDuration(order.startDate, order.endDate).toString(),
            )}
          </Badge>
        </div>
      </div>
    </div>
  )
}
