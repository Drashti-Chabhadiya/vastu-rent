import { cn } from '#/lib/utils'

interface RecentListingsTableProps {
  products?: any[]
  isLoading: boolean
}

export const RecentListingsTable = ({
  products = [],
  isLoading,
}: RecentListingsTableProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Listings</h3>
        <button className="text-xs font-bold text-dash-brand hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50">
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase">
                Listing
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase">
                Category
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase">
                Owner
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-center">
                Price / Day
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-center">
                Status
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-right">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
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
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80'
                        }
                        alt={item.title}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span className="text-xs font-bold text-dash-text">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-dash-text-soft">
                    {item.category?.name || 'Uncategorized'}
                  </td>
                  <td className="py-3 text-xs text-dash-text-soft">
                    {item.owner?.name || 'Unknown'}
                  </td>
                  <td className="py-3 text-xs font-bold text-dash-text text-center">
                    ₹{item.price}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-md text-[10px] font-bold',
                        item.isAvailable
                          ? 'bg-green-50 text-green-600'
                          : 'bg-orange-50 text-orange-600',
                      )}
                    >
                      {item.isAvailable ? 'Active' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-dash-text-muted text-right">
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
