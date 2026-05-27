import { useState } from 'react'
import { Filter, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface RevenueTransactionsTableProps {
  recentTransactions: any[]
}

export const RevenueTransactionsTable = ({
  recentTransactions = [],
}: RevenueTransactionsTableProps) => {
  const [selectedProduct, setSelectedProduct] = useState('all')

  // Dynamic products list for filtering transactions
  const uniqueProducts = Array.from(
    new Set(
      recentTransactions.map((t: any) => t.product?.title).filter(Boolean),
    ),
  )

  // Filtered recent transactions
  const filteredTransactions = recentTransactions.filter((trans: any) => {
    return selectedProduct === 'all' || trans.product?.title === selectedProduct
  })

  return (
    <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="text-[15px] font-black text-foreground/90">
            Recent Revenue Transactions
          </h3>
          <p className="text-[11px] font-bold text-muted-dark mt-0.5">
            Successful orders received from customers.
          </p>
        </div>

        {/* Transactions Product Filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-muted-dark" />
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="h-8 rounded-lg bg-dash-bg-soft hover:bg-dash-bg-soft/80 border-none text-[10px] font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20 w-[140px] px-2.5 transition-all">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent className="bg-card rounded-lg shadow-2xl border-none p-1 animate-in fade-in zoom-in-95 duration-200 max-h-[200px]">
              <SelectItem
                value="all"
                className="text-[10px] font-bold text-dash-text-soft rounded-md focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                All Products
              </SelectItem>
              {uniqueProducts.map((p: any) => (
                <SelectItem
                  key={p}
                  value={p}
                  className="text-[10px] font-bold text-dash-text-soft rounded-md focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 bg-muted-light rounded-2xl border border-border/30">
            <span className="text-xs font-black text-muted-dark uppercase tracking-widest">
              No successful orders found
            </span>
          </div>
        ) : (
          filteredTransactions.slice(0, 5).map((trans: any) => (
            <div
              key={trans.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-border/30 hover:bg-muted-light/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/30 shadow-sm flex-shrink-0">
                  {trans.product?.image ? (
                    <img
                      src={trans.product.image}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full bg-muted-light/80 flex items-center justify-center font-bold text-muted-foreground/85 uppercase text-xs">
                      IMG
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-muted-dark uppercase tracking-widest">
                    ID #ORD-{trans.id.slice(-5).toUpperCase()}
                  </p>
                  <p className="text-xs font-black text-foreground/90 leading-snug">
                    {trans.product?.title}
                  </p>
                  <p className="text-[9px] font-bold text-muted-dark">
                    {format(new Date(trans.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-black text-foreground/90">
                    ₹{trans.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-muted-dark block">
                    Gross
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-muted-dark group-hover:text-emerald-600 transition-colors"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
