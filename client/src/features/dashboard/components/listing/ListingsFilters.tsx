import { Search } from 'lucide-react'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface ListingsFiltersProps {
  search: string
  setSearch: (val: string) => void
  categoryFilter: string
  setCategoryFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  categories?: any[]
}

export const ListingsFilters = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories,
}: ListingsFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-card rounded-[2rem] shadow-sm border border-border/30">
      <div className="md:col-span-2 relative">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-dash-text-soft opacity-40"
          size={18}
        />
        <Input
          placeholder="Search by title or description..."
          className="h-14 pl-12 bg-transparent border-none focus-visible:ring-0 text-dash-text font-bold placeholder:text-dash-text-soft/40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="h-14 border-none bg-dash-bg-soft hover:bg-dash-bg-soft/80 rounded-2xl font-extrabold text-dash-text transition-all focus:ring-2 focus:ring-dash-brand/20 px-6">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-card rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
          <SelectItem
            value="all"
            className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
          >
            All Categories
          </SelectItem>
          {categories?.map((cat: any) => (
            <SelectItem
              key={cat.id}
              value={cat.id}
              className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
            >
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-14 border-none bg-dash-bg-soft hover:bg-dash-bg-soft/80 rounded-2xl font-extrabold text-dash-text transition-all focus:ring-2 focus:ring-dash-brand/20 px-6">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent className="bg-card rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
          <SelectItem
            value="all"
            className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
          >
            Any Status
          </SelectItem>
          <SelectItem
            value="available"
            className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
          >
            Public
          </SelectItem>
          <SelectItem
            value="unavailable"
            className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
          >
            Hidden
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
