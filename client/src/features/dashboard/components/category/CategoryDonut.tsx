const categories = [
  {
    name: 'Electronics',
    percentage: '30.2%',
    count: '7,682',
    color: 'var(--color-dash-brand)',
  },
  {
    name: 'Property',
    percentage: '24.5%',
    count: '6,231',
    color: 'var(--color-brand-light)',
  },
  {
    name: 'Furniture',
    percentage: '15.8%',
    count: '4,018',
    color: 'var(--color-brand-light-light)',
  },
  {
    name: 'Clothing',
    percentage: '12.6%',
    count: '3,205',
    color: 'var(--color-dash-warning-light)',
  },
  {
    name: 'Vehicles',
    percentage: '8.7%',
    count: '2,214',
    color: 'var(--color-dash-error-light)',
  },
  {
    name: 'Others',
    percentage: '8.2%',
    count: '2,080',
    color: 'var(--color-dash-border)',
  },
]

export const CategoryDonut = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="font-bold text-dash-text mb-8">Listings by Category</h3>

      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-8">
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg
            viewBox="0 0 36 36"
            className="w-full h-full transform -rotate-90"
          >
            {/* Donut Segments - Simplified SVG arcs */}
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="var(--color-dash-border)"
              strokeWidth="4"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="var(--color-dash-brand)"
              strokeWidth="4"
              strokeDasharray="30 100"
              strokeDashoffset="0"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="var(--color-brand-light)"
              strokeWidth="4"
              strokeDasharray="25 100"
              strokeDashoffset="-30"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="var(--color-brand-light-light)"
              strokeWidth="4"
              strokeDasharray="15 100"
              strokeDashoffset="-55"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="var(--color-dash-warning-light)"
              strokeWidth="4"
              strokeDasharray="12 100"
              strokeDashoffset="-70"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="var(--color-dash-error-light)"
              strokeWidth="4"
              strokeDasharray="8 100"
              strokeDashoffset="-82"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-dash-text">25,430</span>
            <span className="text-[10px] font-bold text-dash-text-muted">
              Total
            </span>
          </div>
        </div>

        <div className="w-full space-y-3">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>
                <span className="text-xs font-bold text-dash-text-soft">
                  {cat.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-dash-text">
                  {cat.percentage}
                </span>
                <span className="text-[10px] text-dash-text-muted ml-1">
                  ({cat.count})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
