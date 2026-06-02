import { cn } from '#/lib/utils'
import { ExploreLink } from '#/components/common/ExploreLink'

interface RecentListingsTableProps {
  products?: any[]
  isLoading: boolean
}

export const RecentListingsTable = ({
  products = [],
  isLoading,
}: RecentListingsTableProps) => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Listings</h3>
        <ExploreLink to="/account/listings">View All</ExploreLink>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left border-b border-border/30">
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase whitespace-nowrap pr-4">
                Listing
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase whitespace-nowrap pr-4">
                Category
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase whitespace-nowrap pr-4">
                Owner
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-center whitespace-nowrap px-4">
                Price / Day
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-center whitespace-nowrap px-4">
                Status
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-right whitespace-nowrap pl-4">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  No listings found
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-muted-light transition-colors"
                >
                  <td className="py-3 whitespace-nowrap pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80'
                        }
                        alt={item.title}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-xs font-bold text-dash-text">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-dash-text-soft whitespace-nowrap pr-4">
                    {item.category?.name || 'Uncategorized'}
                  </td>
                  <td className="py-3 text-xs text-dash-text-soft whitespace-nowrap pr-4">
                    {item.owner?.name || 'Unknown'}
                  </td>
                  <td className="py-3 text-xs font-bold text-dash-text text-center whitespace-nowrap px-4">
                    ₹{item.price}
                  </td>
                  <td className="py-3 text-center whitespace-nowrap px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-md text-[10px] font-bold',
                        item.isAvailable
                          ? 'bg-primary-soft text-primary'
                          : 'bg-orange-50 text-orange-600',
                      )}
                    >
                      {item.isAvailable ? 'Active' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-dash-text-muted text-right whitespace-nowrap pl-4">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
