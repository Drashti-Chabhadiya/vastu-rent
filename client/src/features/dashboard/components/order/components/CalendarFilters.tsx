import { Filter } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface CalendarFiltersProps {
  selectedProduct: string
  setSelectedProduct: (val: string) => void
  selectedStatus: string
  setSelectedStatus: (val: string) => void
  uniqueProducts: string[]
}

export const CalendarFilters = ({
  selectedProduct,
  setSelectedProduct,
  selectedStatus,
  setSelectedStatus,
  uniqueProducts,
}: CalendarFiltersProps) => {
  const showClearButton = selectedProduct !== 'all' || selectedStatus !== 'all'

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
        <Filter size={14} /> Filter Bookings:
      </div>

      {/* Product dropdown Filter */}
      <div className="space-y-1">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="h-10 rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-slate-200 transition-all cursor-pointer"
        >
          <option value="all">All Products</option>
          {uniqueProducts.map((prod: string) => (
            <option key={prod} value={prod}>
              {prod}
            </option>
          ))}
        </select>
      </div>

      {/* Status dropdown Filter */}
      <div className="space-y-1">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-slate-200 transition-all cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="confirmed">Confirmed / Active</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected / Cancelled</option>
        </select>
      </div>

      {/* Clear Filters */}
      {showClearButton && (
        <Button
          onClick={() => {
            setSelectedProduct('all')
            setSelectedStatus('all')
          }}
          variant="ghost"
          className="h-10 px-4 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 cursor-pointer"
        >
          Reset Filters
        </Button>
      )}
    </div>
  )
}
