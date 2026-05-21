import { useCategories } from '#/hook'
import { useMemo } from 'react'

const fallbackColors = [
  'var(--color-dash-brand)',
  'var(--color-brand-light)',
  'var(--color-brand-light-light)',
  'var(--color-dash-warning-light)',
  'var(--color-dash-error-light)',
  'var(--color-dash-border)',
]

export const CategoryDonut = () => {
  const { data: categories = [], isLoading } = useCategories()
  console.log('categories :>> ', categories)

  const chartData = useMemo(() => {
    if (!categories?.length) return []

    // Total products count
    const total = categories.reduce(
      (acc: number, item: any) => acc + (item._count?.products || 0),
      0,
    )

    let cumulative = 0

    return categories.map((item: any, index: number) => {
      const value = item._count?.products || 0

      const percentage = total ? (value / total) * 100 : 0

      const data = {
        name: item.name,
        count: value,
        percentage: percentage.toFixed(1),
        color: item.color || fallbackColors[index % fallbackColors.length],

        strokeDasharray: `${percentage} ${100 - percentage}`,

        strokeDashoffset: -cumulative,
      }

      cumulative += percentage

      return data
    })
  }, [categories])

  const totalCount = useMemo(() => {
    return categories.reduce(
      (acc: number, item: any) => acc + (item._count?.products || 0),
      0,
    )
  }, [categories])

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="font-bold text-dash-text mb-8">Listings by Category</h3>

      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-8">
        {/* Donut Chart */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg
            viewBox="0 0 36 36"
            className="w-full h-full transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke="var(--color-dash-border)"
              strokeWidth="4"
            />

            {/* Dynamic Segments */}
            {chartData.map((item: any, index: number) => (
              <circle
                key={index}
                cx="18"
                cy="18"
                r="15.9"
                fill="transparent"
                stroke={item.color}
                strokeWidth="4"
                strokeDasharray={item.strokeDasharray}
                strokeDashoffset={item.strokeDashoffset}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-dash-text">
              {totalCount.toLocaleString()}
            </span>

            <span className="text-[10px] font-bold text-dash-text-muted">
              Total
            </span>
          </div>
        </div>

        {/* Category List */}
        <div className="w-full space-y-3">
          {chartData.map((cat: any) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />

                <span className="text-xs font-bold text-dash-text-soft">
                  {cat.name}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-dash-text">
                  {cat.percentage}%
                </span>

                <span className="text-[10px] text-dash-text-muted ml-1">
                  ({cat.count.toLocaleString()})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
