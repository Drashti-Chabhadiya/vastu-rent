import { Star } from 'lucide-react'

const reviews = [
  {
    id: 1,
    user: 'Riya Singh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya',
    rating: 5,
    comment: 'Great experience! The product was in excellent condition.',
    product: 'Canon EOS 200D II',
    productImage:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80',
    date: 'May 18, 2024',
  },
  {
    id: 2,
    user: 'Manish Patel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manish',
    rating: 4,
    comment: 'Good service and timely delivery. Highly recommended!',
    product: '3 Seater Sofa',
    productImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80',
    date: 'May 18, 2024',
  },
  {
    id: 3,
    user: 'Anjali Verma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
    rating: 5,
    comment: 'Very smooth process and helpful support.',
    product: 'Honda Activa 6G',
    productImage:
      'https://images.unsplash.com/photo-1558981403-c5f91cbba527?w=100&q=80',
    date: 'May 17, 2024',
  },
]

export const RecentReviews = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Reviews</h3>
        <button className="text-xs font-bold text-dash-brand hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex items-start justify-between gap-4 group"
          >
            <div className="flex gap-3">
              <img
                src={review.avatar}
                alt={review.user}
                className="w-10 h-10 rounded-full bg-gray-100"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-dash-text">
                    {review.user}
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? 'fill-brand-light bg-primary-light'
                            : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-dash-text-soft mt-1 leading-relaxed line-clamp-2">
                  {review.comment}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-[140px] border-l border-gray-100 pl-4">
              <img
                src={review.productImage}
                alt={review.product}
                className="w-8 h-8 rounded-md object-cover"
              />
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-dash-text truncate">
                  {review.product}
                </p>
                <p className="text-[9px] text-dash-text-muted">{review.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
