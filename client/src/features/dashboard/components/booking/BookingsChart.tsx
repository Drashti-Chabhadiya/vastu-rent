import { ChevronDown } from 'lucide-react'

export const BookingsChart = () => {
  // Mock data for the curve
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-dash-text">Bookings Overview</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-dash-text cursor-pointer hover:border-gray-300">
          This Week <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="relative h-64 w-full">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[11px] text-dash-text-muted font-bold">
          <span>2K</span>
          <span>1.5K</span>
          <span>1K</span>
          <span>500</span>
          <span>0</span>
        </div>

        {/* Grid Lines */}
        <div className="ml-10 h-56 border-b border-gray-100 flex flex-col justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-full border-t border-gray-50 border-dashed"
            ></div>
          ))}
        </div>

        {/* The Chart */}
        <div className="absolute left-10 right-0 top-0 bottom-8">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            {/* Gradient Area */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-brand-light)"
                  stopOpacity="0.1"
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-brand-light)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <path
              d="M 0 60 C 15 65, 20 40, 30 45 C 40 50, 50 65, 60 60 C 70 55, 80 40, 90 35 L 100 20 L 100 100 L 0 100 Z"
              fill="url(#chartGradient)"
            />
            {/* Line */}
            <path
              d="M 0 60 C 15 65, 20 40, 30 45 C 40 50, 50 65, 60 60 C 70 55, 80 40, 90 35 L 100 20"
              fill="none"
              stroke="var(--color-brand-light)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data points */}
            {[
              { x: 0, y: 60 },
              { x: 16.6, y: 65 },
              { x: 33.3, y: 45 },
              { x: 50, y: 60 },
              { x: 66.6, y: 55 },
              { x: 83.3, y: 35 },
              { x: 100, y: 20 },
            ].map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="white"
                stroke="var(--color-brand-light)"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="absolute left-10 right-0 bottom-0 flex justify-between text-[11px] text-dash-text-muted font-bold">
          <span>May 12</span>
          <span>May 13</span>
          <span>May 14</span>
          <span>May 15</span>
          <span>May 16</span>
          <span>May 17</span>
          <span>May 18</span>
        </div>
      </div>
    </div>
  )
}
