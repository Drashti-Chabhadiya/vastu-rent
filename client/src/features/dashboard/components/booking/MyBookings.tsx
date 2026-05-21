import { useMyRentals } from '#/hook'
import {
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

export const MyBookings = () => {
  const { data: rentals, isLoading } = useMyRentals()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="space-y-2.5">
          <div className="h-7 bg-gray-200 rounded-lg w-48" />
          <div className="h-4 bg-gray-100 rounded-md w-96" />
        </div>
        {/* Bookings list */}
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6"
            >
              {/* Product Info */}
              <div className="flex gap-4 flex-1">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 shrink-0" />
                <div className="flex flex-col justify-between py-1 flex-1">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-150 rounded w-16" />
                      <div className="h-5 bg-gray-150 rounded w-16" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-48" />
                  </div>
                  <div className="h-4 bg-gray-150 rounded w-24" />
                </div>
              </div>
              {/* Date & Price Info */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-8 md:gap-12 px-2">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="w-4 h-4 bg-gray-100 rounded mt-4" />
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[120px] space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-150 rounded w-12" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!rentals || rentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-gray-300" size={40} />
        </div>
        <h3 className="text-xl font-bold text-dash-text">No Bookings Yet</h3>
        <p className="text-dash-text-soft mt-2 max-w-xs text-center font-medium">
          You haven't rented any products yet. Browse the marketplace to find
          items for rent!
        </p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <Clock size={12} /> Confirmed
          </Badge>
        )
      case 'picked_up':
        return (
          <Badge className="bg-purple-50 text-purple-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <Clock size={12} /> Picked Up
          </Badge>
        )
      case 'in_use':
        return (
          <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <Clock size={12} /> In Use
          </Badge>
        )
      case 'returned':
        return (
          <Badge className="bg-orange-50 text-orange-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <Clock size={12} /> Returned
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-50 text-green-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-50 text-red-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <XCircle size={12} /> Cancelled
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <AlertCircle size={12} /> Pending
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-dash-text flex items-center gap-3">
            <Calendar className="text-dash-brand" size={28} />
            My Bookings
          </h2>
          <p className="text-dash-text-soft text-sm font-medium">
            Manage and track your active and past rental items.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {rentals.map((rental: any) => (
          <div
            key={rental.id}
            className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-dash-brand/20 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Info */}
              <div className="flex gap-4 flex-1">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                  <img
                    src={rental.product.images[0]}
                    alt={rental.product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-dash-brand bg-dash-brand/10 px-2 py-0.5 rounded-md">
                        {rental.product.category.name}
                      </span>
                      {getStatusBadge(rental.status)}
                    </div>
                    <h4 className="text-lg font-extrabold text-dash-text group-hover:text-dash-brand transition-colors">
                      {rental.product.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-dash-text-soft text-[13px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-dash-brand" />
                      {rental.product.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Price Info */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-8 md:gap-12 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider mb-1">
                      Start Date
                    </span>
                    <span className="text-sm font-extrabold text-dash-text">
                      {format(new Date(rental.startDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-dash-text-muted mt-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider mb-1">
                      End Date
                    </span>
                    <span className="text-sm font-extrabold text-dash-text">
                      {format(new Date(rental.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end min-w-[120px]">
                  <span className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider mb-1">
                    Total Paid
                  </span>
                  <div className="text-xl font-black text-dash-brand flex items-center">
                    <IndianRupee size={18} strokeWidth={3} />
                    {rental.totalPrice.toLocaleString()}
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-black uppercase mt-1 px-2 py-0.5 rounded-md',
                      rental.paymentStatus === 'paid'
                        ? 'text-green-600 bg-green-50'
                        : 'text-yellow-600 bg-yellow-50',
                    )}
                  >
                    {rental.paymentStatus || 'Pending'}
                  </span>
                  <span className="text-[8px] font-bold text-dash-text-soft opacity-60 uppercase tracking-tighter mt-0.5">
                    via{' '}
                    {rental.paymentMethod === 'cash'
                      ? 'Cash at Pickup'
                      : 'Online'}
                  </span>
                </div>

                <button className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-dash-text-soft hover:bg-dash-brand hover:text-white transition-all duration-300">
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
