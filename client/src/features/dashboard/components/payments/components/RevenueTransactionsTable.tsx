import { useState } from 'react'
import { Filter, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

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
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="text-[15px] font-black text-slate-800">
            Recent Revenue Transactions
          </h3>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">
            Successful orders received from customers.
          </p>
        </div>

        {/* Transactions Product Filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-slate-400" />
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="h-8 rounded-lg border border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-700 outline-none focus:border-slate-200 transition-all cursor-pointer px-2"
          >
            <option value="all">All Products</option>
            {uniqueProducts.map((p: any) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              No successful orders found
            </span>
          </div>
        ) : (
          filteredTransactions.slice(0, 5).map((trans: any) => (
            <div
              key={trans.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-55 hover:bg-slate-50/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                  {trans.product?.image ? (
                    <img
                      src={trans.product.image}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-150 flex items-center justify-center font-bold text-slate-500 uppercase text-xs">
                      IMG
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    ID #ORD-{trans.id.slice(-5).toUpperCase()}
                  </p>
                  <p className="text-xs font-black text-slate-800 leading-snug">
                    {trans.product?.title}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400">
                    {format(
                      new Date(trans.createdAt),
                      'dd MMM yyyy, hh:mm a',
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-black text-slate-800">
                    ₹{trans.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 block">
                    Gross
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-300 group-hover:text-emerald-600 transition-colors"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
