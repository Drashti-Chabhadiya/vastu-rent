import { User as UserIcon, MapPin } from 'lucide-react'

interface OrderCustomerDetailsCardProps {
  order: any
}

export const OrderCustomerDetailsCard = ({
  order,
}: OrderCustomerDetailsCardProps) => {
  return (
    <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
      <h3 className="text-[14px] font-black text-[#1e293b] mb-8">
        Customer Details
      </h3>
      <div className="grid grid-cols-2 gap-20">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-[#e2f5ec] flex items-center justify-center text-[#059669]">
            <UserIcon size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[16px] font-black text-[#1e293b] leading-tight">
              {order.renter?.name}
            </p>
            <p className="text-[12px] font-bold text-slate-500">
              {order.renter?.email}
            </p>
            <p className="text-[12px] font-bold text-slate-500">
              +91 {order.renter?.phone || '98765 43210'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[9px] font-black text-[#334155] uppercase tracking-widest block">
            Pickup & Location Details
          </span>
          <div className="text-[12px] font-bold text-slate-600 leading-relaxed space-y-1">
            <p className="font-black text-[#1e293b] flex items-center gap-1.5 text-xs">
              <MapPin size={12} className="text-[#059669]" /> Primary Location:
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
            {order.product?.deliveryOptions &&
              order.product.deliveryOptions.length > 0 && (
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
  )
}
