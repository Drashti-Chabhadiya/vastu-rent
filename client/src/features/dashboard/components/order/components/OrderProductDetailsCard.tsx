import { IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'

interface OrderProductDetailsCardProps {
  order: any
  calculateDuration: (start: string, end: string) => number
}

export const OrderProductDetailsCard = ({
  order,
  calculateDuration,
}: OrderProductDetailsCardProps) => {
  return (
    <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
      <h3 className="text-[14px] font-black text-[#1e293b] mb-8">
        Product Details
      </h3>
      <div className="flex gap-8">
        <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-sm border border-slate-50">
          <img
            src={order.product?.images?.[0]}
            className="w-full h-full object-cover"
            alt={order.product?.title}
          />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <div className="flex items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-[#e2f5ec] px-3 py-1 rounded-lg">
              {order.product?.category?.name || 'HOME DECOR'}
            </span>
          </div>
          <h4 className="text-xl font-black text-[#1e293b]">
            {order.product?.title}
          </h4>
          <div className="flex items-center gap-0.5 text-[#059669] font-black text-lg">
            <IndianRupee size={16} strokeWidth={3} />
            {order.product?.price.toLocaleString()}
            <span className="text-slate-400 text-[11px] font-bold ml-1">
              / day
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end gap-1.5">
          <span className="text-[9px] font-black text-[#334155] uppercase tracking-widest">
            Rental Period
          </span>
          <span className="text-[14px] font-black text-[#1e293b]">
            {format(new Date(order.startDate), 'dd MMM yyyy')} -{' '}
            {format(new Date(order.endDate), 'dd MMM yyyy')}
          </span>
          <Badge className="bg-[#f1f5f9] text-[#475569] border-none px-4 py-1 rounded-full font-bold text-[11px]">
            {calculateDuration(order.startDate, order.endDate)} Days
          </Badge>
        </div>
      </div>
    </div>
  )
}
