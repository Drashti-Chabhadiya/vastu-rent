import { cn } from '#/lib/utils'

interface Order {
  id: string
  product: string
  image: string
  orderId: string
  date: string
  price: string
  status: 'Completed' | 'Confirmed' | 'Pending' | 'Cancelled'
}

const orders: Order[] = [
  {
    id: '1',
    product: 'Canon EOS 200D II',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80',
    orderId: '#ORD12456',
    date: 'May 18, 2024',
    price: '₹1,200',
    status: 'Completed',
  },
  {
    id: '2',
    product: '3 Seater Sofa',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80',
    orderId: '#ORD12455',
    date: 'May 18, 2024',
    price: '₹800',
    status: 'Confirmed',
  },
  {
    id: '3',
    product: 'Honda Activa 6G',
    image:
      'https://images.unsplash.com/photo-1558981403-c5f91cbba527?w=100&q=80',
    orderId: '#ORD12454',
    date: 'May 17, 2024',
    price: '₹500',
    status: 'Pending',
  },
  {
    id: '4',
    product: 'Designer Lehenga',
    image:
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=100&q=80',
    orderId: '#ORD12453',
    date: 'May 17, 2024',
    price: '₹2,500',
    status: 'Completed',
  },
  {
    id: '5',
    product: 'LED Projector',
    image:
      'https://images.unsplash.com/photo-1535016120720-40c646bebbbb?w=100&q=80',
    orderId: '#ORD12452',
    date: 'May 17, 2024',
    price: '₹1,000',
    status: 'Cancelled',
  },
]

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const styles = {
    Completed: 'bg-green-50 text-green-600',
    Confirmed: 'bg-blue-50 text-blue-600',
    Pending: 'bg-orange-50 text-orange-600',
    Cancelled: 'bg-red-50 text-red-600',
  }

  return (
    <span
      className={cn('px-3 py-1 rounded-full text-xs font-bold', styles[status])}
    >
      {status}
    </span>
  )
}

export const RecentOrders = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Orders</h3>
        <button className="text-xs font-bold text-dash-brand hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={order.image}
                  alt={order.product}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-dash-text line-clamp-1">
                  {order.product}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-dash-text-muted">
                    {order.orderId}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-[11px] text-dash-text-muted">
                    {order.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-dash-text mb-1">
                {order.price}
              </p>
              <StatusBadge status={order.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
