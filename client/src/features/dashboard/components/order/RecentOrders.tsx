import { useOrders } from '#/hook'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface Order {
  id: string
  product: {
    title: string
    images?: string[]
  }
  renter?: {
    name?: string
    email?: string
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  createdAt: string
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-50 text-green-600',
    confirmed: 'bg-blue-50 text-blue-600',
    active: 'bg-blue-50 text-blue-600',
    pending: 'bg-orange-50 text-orange-600',
    cancelled: 'bg-red-50 text-red-600',
    rejected: 'bg-red-50 text-red-600',
    returned: 'bg-purple-50 text-purple-600',
  }

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-bold capitalize',
        styles[status] || 'bg-gray-50 text-gray-600',
      )}
    >
      {status}
    </span>
  )
}

export const RecentOrders = () => {
  const { data: orders = [], isLoading } = useOrders()

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
        <h3 className="font-bold text-dash-text mb-6">Recent Orders</h3>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-200"></div>

                <div>
                  <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 w-24 bg-gray-100 rounded"></div>
                </div>
              </div>

              <div>
                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Orders</h3>

        <Button
          variant="link"
          className="text-xs font-extrabold text-[#15803d] hover:text-[#166534] hover:underline p-0 h-auto active:scale-[0.98] transition-all cursor-pointer"
        >
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-dash-text-muted">
              No recent orders found
            </p>
          </div>
        ) : (
          orders.slice(0, 5).map((order: Order) => (
            <div
              key={order.id}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={
                      order.product.images?.[0] ||
                      'https://placehold.co/100x100/png'
                    }
                    alt={order.product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-dash-text line-clamp-1">
                    {order.product.title}
                  </p>

                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-dash-text-muted">
                      #{order.id.slice(0, 8)}
                    </span>

                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>

                    <span className="text-[11px] text-dash-text-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {order.renter?.name && (
                    <p className="text-[11px] text-dash-text-muted mt-1">
                      By {order.renter.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-dash-text mb-1">
                  ₹{order.totalPrice}
                </p>

                <StatusBadge status={order.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
