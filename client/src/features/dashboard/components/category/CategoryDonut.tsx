import { useCategories } from '#/hook'
import { useMemo } from 'react'

export const CategoryDonut = () => {
  const { data: categories = [], isLoading } = useCategories()
  const chartData = useMemo(() => {
    if (!categories?.length) return []

    // Total products count
    const total = categories.reduce(
      (acc: number, item: any) => acc + (item._count?.products || 0),
      0,
    )

    // Filter to only categories that have products (non-zero count)
    // If no categories have products, fall back to displaying all categories (with 0.0%)
    const activeCategories = categories.filter(
      (item: any) => (item._count?.products || 0) > 0,
    )
    const displayCategories =
      activeCategories.length > 0 ? activeCategories : categories

    let cumulative = 0

    return displayCategories.map((item: any) => {
      const value = item._count?.products || 0
      const percentage = total ? (value / total) * 100 : 0

      // Find stable index from original categories to keep colors consistent
      const originalIndex = categories.findIndex((c: any) => c.id === item.id)
      const indexToUse = originalIndex !== -1 ? originalIndex : 0

      // Dynamically generate a distinct, vibrant, and high-contrast HSL color using the golden angle
      const generatedColor = `hsl(${(indexToUse * 137.5) % 360}, 65%, 45%)`

      const data = {
        name: item.name,
        count: value,
        percentage: percentage.toFixed(1),
        color: item.color || generatedColor,
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
      <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
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
            {chartData
              .filter((item: any) => item.count > 0)
              .map((item: any, index: number) => (
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
        <div className="w-full space-y-3 max-h-40 overflow-y-auto pr-1">
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
