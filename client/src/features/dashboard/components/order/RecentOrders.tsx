import { useOrders } from '#/hook'
import { cn } from '#/lib/utils'
import { ExploreLink } from '#/components/common/ExploreLink'

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
    completed: 'bg-primary-soft text-primary',
    confirmed: 'bg-info text-info-foreground',
    active: 'bg-info text-info-foreground',
    pending: 'bg-orange-50 text-orange-600',
    cancelled: 'bg-danger text-destructive',
    rejected: 'bg-danger text-destructive',
    returned: 'bg-purple-50 text-purple-600',
  }

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-bold capitalize',
        styles[status] || 'bg-muted-light text-muted-foreground',
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
      <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
        <h3 className="font-bold text-dash-text mb-6">Recent Orders</h3>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted"></div>

                <div>
                  <div className="h-3 w-32 bg-muted rounded mb-2"></div>
                  <div className="h-2 w-24 bg-muted/50 rounded"></div>
                </div>
              </div>

              <div>
                <div className="h-3 w-16 bg-muted rounded mb-2"></div>
                <div className="h-6 w-20 bg-muted/50 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Orders</h3>

        <ExploreLink to="/account/orders">View All</ExploreLink>
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
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/50">
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

                    <span className="w-1 h-1 bg-muted-dark/20 rounded-full"></span>

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
