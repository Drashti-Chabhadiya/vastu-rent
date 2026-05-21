import { useState } from 'react'
import { Search, Trash2, Star, User as UserIcon, Package } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useAdminReviews, useDeleteReview } from '#/hook'

export const ReviewsManagement = () => {
  const [search, setSearch] = useState('')

  const { data: reviewsData, isLoading } = useAdminReviews({ search })

  const deleteMutation = useDeleteReview()

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted z-10"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search reviews by comment, user, or product..."
            className="pl-10 h-11 bg-dash-bg-soft border-none rounded-xl text-sm text-dash-text placeholder:text-dash-text-muted focus-visible:ring-2 focus-visible:ring-brand-light/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Reviews Table/List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  Rating & Comment
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-center">
                  Date
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={5}
                      className="px-6 py-8 h-16 bg-gray-50/20"
                    ></td>
                  </tr>
                ))
              ) : reviewsData?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-dash-text-muted text-sm"
                  >
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviewsData?.map((review: any) => (
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-light/10 flex items-center justify-center bg-primary-light font-bold text-xs">
                          {review.user?.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon size={16} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-dash-text">
                            {review.user?.name || 'Anonymous'}
                          </span>
                          <span className="text-[10px] text-dash-text-muted">
                            {review.user?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-dash-text-muted" />
                        <span className="text-xs font-bold text-dash-text-soft truncate max-w-[150px]">
                          {review.product?.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={cn(
                                i < review.rating
                                  ? 'text-orange-400 fill-orange-400'
                                  : 'text-gray-200 fill-gray-200',
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-dash-text italic line-clamp-2">
                          "{review.comment || 'No comment'}"
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-dash-text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete Review"
                        onClick={() => {
                          if (confirm('Permanently delete this review?')) {
                            deleteMutation.mutate(review.id)
                          }
                        }}
                        className="h-9 w-9 text-dash-text-soft hover:text-dash-error hover:bg-dash-error-light rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
