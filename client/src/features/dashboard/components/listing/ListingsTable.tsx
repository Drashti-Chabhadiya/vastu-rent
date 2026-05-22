import { cn } from '#/lib/utils'
import { Eye, EyeOff, Trash2, ExternalLink, Pencil } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

interface ListingsTableProps {
  products: any[]
  isLoading: boolean
  onToggleStatus: (id: string, isAvailable: boolean) => void
  onDelete: (product: any) => void
  onEdit: (product: any) => void
  currentUser: any
}

export const ListingsTable = ({
  products,
  isLoading,
  onToggleStatus,
  onDelete,
  onEdit,
  currentUser,
}: ListingsTableProps) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50 bg-gray-50/50">
              <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em]">
                Listing Info
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em]">
                Category
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em]">
                Owner
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] text-center">
                Price / Day
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] text-center">
                Visibility
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] text-right">
                Management
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                      <div className="space-y-2">
                        <div className="h-3.5 bg-gray-200 rounded-md w-28" />
                        <div className="h-2.5 bg-gray-100 rounded-md w-16" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-100 rounded-lg w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded-md w-20" />
                      <div className="h-2.5 bg-gray-100 rounded-md w-28" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded-md w-12 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 bg-gray-100 rounded-full w-20 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-150" />
                      <div className="w-8 h-8 rounded-lg bg-gray-150" />
                    </div>
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-20 text-center text-dash-text-soft font-bold uppercase tracking-widest"
                >
                  No listings available
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-gray-50/80 transition-all"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                        <img
                          src={
                            item.images?.[0] ||
                            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80'
                          }
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-extrabold text-dash-text group-hover:text-dash-brand transition-colors line-clamp-1">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-dash-text-soft font-bold uppercase tracking-wider">
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="rounded-lg bg-white border-gray-100 text-dash-text-soft font-bold text-[10px] uppercase tracking-wider h-6"
                    >
                      {item.category?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-dash-text">
                        {item.owner?.name || 'Vastu System'}
                      </span>
                      <span className="text-[10px] text-dash-text-soft font-bold">
                        {item.owner?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] font-bold text-dash-text-soft">
                        ₹
                      </span>
                      <span className="text-sm font-extrabold text-dash-text">
                        {item.price?.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onToggleStatus(item.id, !item.isAvailable)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all active:scale-95',
                        item.isAvailable
                          ? 'bg-dash-brand/10 text-dash-brand hover:bg-dash-brand/20'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
                      )}
                    >
                      {item.isAvailable ? (
                        <>
                          <Eye size={12} strokeWidth={2.5} />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} strokeWidth={2.5} />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/products/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                        title="View Listing on Marketplace"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg text-dash-text-soft hover:bg-dash-brand/10 hover:text-dash-brand transition-all"
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-lg text-dash-text-soft hover:bg-dash-brand/10 hover:text-dash-brand transition-all"
                        title="Edit Listing"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        className={cn(
                          'w-8 h-8 rounded-lg transition-all',
                          currentUser?.role === 'superAdmin' ||
                            item.ownerId === currentUser?.id
                            ? 'text-dash-text-soft hover:bg-red-50 hover:text-red-500'
                            : 'text-dash-text-soft hover:bg-orange-50 hover:text-orange-500',
                        )}
                        title={
                          currentUser?.role === 'superAdmin' ||
                          item.ownerId === currentUser?.id
                            ? 'Delete Listing'
                            : 'Request Deletion'
                        }
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
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
