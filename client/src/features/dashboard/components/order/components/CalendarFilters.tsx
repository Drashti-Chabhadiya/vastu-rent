import { Filter } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

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
    <div className="bg-card p-6 rounded-[2rem] border border-border/30 shadow-sm flex flex-wrap gap-4 items-center animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-xs font-black text-muted-dark uppercase tracking-widest">
        <Filter size={14} /> Filter Bookings:
      </div>

      {/* Product dropdown Filter */}
      <div className="space-y-1">
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="h-10 rounded-xl bg-dash-bg-soft hover:bg-dash-bg-soft/80 border-none px-4 text-xs font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20 w-[180px] transition-all">
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent className="bg-card rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200 max-h-[300px]">
            <SelectItem
              value="all"
              className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
            >
              All Products
            </SelectItem>
            {uniqueProducts.map((prod: string) => (
              <SelectItem
                key={prod}
                value={prod}
                className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                {prod}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status dropdown Filter */}
      <div className="space-y-1">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="h-10 rounded-xl bg-dash-bg-soft hover:bg-dash-bg-soft/80 border-none px-4 text-xs font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20 w-[160px] transition-all">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-card rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
            <SelectItem
              value="all"
              className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
            >
              All Statuses
            </SelectItem>
            <SelectItem
              value="pending"
              className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
            >
              Pending Approval
            </SelectItem>
            <SelectItem
              value="confirmed"
              className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
            >
              Confirmed / Active
            </SelectItem>
            <SelectItem
              value="completed"
              className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
            >
              Completed
            </SelectItem>
            <SelectItem
              value="rejected"
              className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
            >
              Rejected / Cancelled
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {showClearButton && (
        <Button
          onClick={() => {
            setSelectedProduct('all')
            setSelectedStatus('all')
          }}
          variant="ghost"
          className="h-10 px-4 rounded-xl text-xs font-black text-muted-foreground/85 hover:bg-muted-light cursor-pointer"
        >
          Reset Filters
        </Button>
      )}
    </div>
  )
}
