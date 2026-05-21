import { ChevronDown, TrendingUp } from 'lucide-react'

export const RevenueChart = () => {
  const bars = [
    { h: 30 },
    { h: 45 },
    { h: 25 },
    { h: 60 },
    { h: 40 },
    { h: 55 },
    { h: 75 },
    { h: 35 },
    { h: 50 },
    { h: 65 },
    { h: 45 },
    { h: 30 },
    { h: 40 },
    { h: 60 },
    { h: 85 },
    { h: 50 },
    { h: 45 },
    { h: 55 },
    { h: 70 },
    { h: 40 },
    { h: 35 },
    { h: 60 },
    { h: 50 },
    { h: 45 },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-dash-text">Revenue Overview</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-dash-text cursor-pointer hover:border-gray-300">
          This Month <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold text-dash-text-muted uppercase">
            Total Revenue
          </p>
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-bold text-dash-text">₹ 45,78,230</h4>
            <div className="flex items-center gap-1 bg-primary-light">
              <TrendingUp size={14} />
              <span className="text-xs font-bold">20.4%</span>
              <span className="text-[10px] text-dash-text-muted ml-1 font-normal">
                from last month
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full flex items-end justify-between gap-1">
        {/* Y-Axis (Implicit in image, adding some spacing) */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-dash-text-muted font-bold h-full">
          <span>8L</span>
          <span>6L</span>
          <span>4L</span>
          <span>2L</span>
          <span>0</span>
        </div>

        <div className="ml-8 flex-1 h-full flex items-end justify-between gap-1.5">
          {bars.map((bar, i) => (
            <div
              key={i}
              className="flex-1 bg-dash-brand rounded-t-sm transition-all duration-500 hover:bg-primary-light"
              style={{ height: `${bar.h}%` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="ml-8 mt-2 flex justify-between text-[10px] text-dash-text-muted font-bold">
        <span>May 1</span>
        <span>May 6</span>
        <span>May 11</span>
        <span>May 16</span>
        <span>May 21</span>
        <span>May 26</span>
        <span>May 31</span>
      </div>
    </div>
  )
}
