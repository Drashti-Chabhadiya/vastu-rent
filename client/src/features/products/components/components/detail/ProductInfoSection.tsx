import {
  Star,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  IndianRupee,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface ProductInfoSectionProps {
  product: any
  productInfo: { label: string; value: string }[]
  paymentMethod: 'online' | 'cash'
  setPaymentMethod: (method: 'online' | 'cash') => void
  handleRentNow: () => void
  createRentalIsPending: boolean
  isPaying: boolean
  startDate: Date | null
  endDate: Date | null
  rentalDays: number
  totalPrice: number
}

export const ProductInfoSection = ({
  product,
  productInfo,
  paymentMethod,
  setPaymentMethod,
  handleRentNow,
  createRentalIsPending,
  isPaying,
  startDate,
  endDate,
  rentalDays,
  totalPrice,
}: ProductInfoSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            {product.title || product.name}
          </h1>
          <Badge className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold text-[10px] uppercase shrink-0">
            <CheckCircle2 size={10} /> Verified
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 text-sm">
              {product.rating || '4.6'}
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <span className="text-gray-500 text-sm font-medium cursor-pointer">
            ({product.reviewsCount || '0'} Reviews)
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-3xl font-black text-primary">
            ₹{product.price.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-gray-500">/day</span>
          {product.securityDeposit > 0 && (
            <span className="ml-3 text-xs font-medium text-gray-400">
              + ₹{product.securityDeposit.toLocaleString()} deposit
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {product.description}
        </p>
      </div>

      <hr className="border-gray-100" />

      {/* Product Information Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Product Information</h3>
        <div className="grid grid-cols-1 gap-y-3">
          {productInfo.map((info) => (
            <div key={info.label} className="grid grid-cols-3">
              <span className="col-span-1 text-sm text-gray-500">{info.label}</span>
              <span className="col-span-2 text-sm font-medium text-gray-900">
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Trust Features */}
      <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
        {[
          {
            icon: <CheckCircle2 size={16} />,
            title: 'Free Delivery',
            desc: 'Within 10 km',
          },
          {
            icon: <MessageCircle size={16} />,
            title: 'Quick Support',
            desc: '24/7 Assistance',
          },
          {
            icon: <ShieldCheck size={16} />,
            title: 'Secure Payment',
            desc: '100% Safe',
          },
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-primary shrink-0">
              {feature.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-900 leading-tight">
                {feature.title}
              </p>
              <p className="text-[10px] text-gray-500">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Save More Banner */}
      <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
          <AlertCircle size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            Save more with longer rentals!
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Rent for a week or more and get up to 20% off.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <div className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
          <IndianRupee size={14} className="text-primary" />
          Payment Method
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('online')}
            className={cn(
              'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
              paymentMethod === 'online'
                ? 'border-brand bg-primary/5 text-primary'
                : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200',
            )}
          >
            <ShieldCheck size={18} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Online Pay
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={cn(
              'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
              paymentMethod === 'cash'
                ? 'border-brand bg-primary/5 text-primary'
                : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200',
            )}
          >
            <MessageCircle size={18} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Cash on Pickup
            </span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleRentNow}
          disabled={createRentalIsPending || isPaying}
          className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all group"
        >
          {createRentalIsPending || isPaying ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : (
            <ArrowRight
              size={16}
              className="mr-2 transition-transform group-hover:translate-x-1"
            />
          )}
          {isPaying ? 'Processing...' : 'Rent Now'}
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all gap-2"
          onClick={() =>
            window.open(
              `mailto:${product.owner?.email || ''}?subject=Inquiry about ${product.title || product.name}`,
            )
          }
        >
          <MessageCircle size={18} /> Chat with Owner
        </Button>
      </div>

      {startDate && (
        <div className="p-4 rounded-xl bg-primary/5 border border-brand/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span className="font-bold">Dates:</span>
            <span>
              {startDate.toLocaleDateString('en-IN')}{' '}
              {endDate
                ? `→ ${endDate.toLocaleDateString('en-IN')}`
                : '→ Pick end date'}
            </span>
          </div>
          {endDate && (
            <>
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span className="font-bold">Rental Fee ({rentalDays} days):</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span className="font-bold">Security Deposit (Refundable):</span>
                <span>₹{(product.securityDeposit || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-brand/10 flex items-center justify-between text-sm text-gray-900 font-black">
                <span>Total Payable:</span>
                <span className="text-primary">
                  ₹{(totalPrice + (product.securityDeposit || 0)).toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
