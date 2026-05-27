interface ProductEarningsBreakdownProps {
  productBreakdown: any[]
}

export const ProductEarningsBreakdown = ({
  productBreakdown = [],
}: ProductEarningsBreakdownProps) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-[15px] font-black text-slate-800">
          Earnings Breakdown by Product
        </h3>
        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
          Total revenue generated per listing.
        </p>
      </div>
      <div className="space-y-4">
        {productBreakdown.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              No listings product earnings found
            </span>
          </div>
        ) : (
          productBreakdown.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
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
                  <h4
                    className="text-xs font-black text-slate-800 truncate max-w-xs"
                    title={item.title}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-400">
                    {item.bookingCount} successful rentals
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black text-emerald-600">
                  ₹{item.totalEarned.toLocaleString()}
                </span>
                <span className="text-[8px] font-bold text-slate-400 block">
                  Total Earnings
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
