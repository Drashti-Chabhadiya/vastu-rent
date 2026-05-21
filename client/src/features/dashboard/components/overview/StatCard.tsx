import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '#/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ElementType
  iconBg: string
  iconColor: string
  sparklineData: number[]
}

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min
  const width = 100
  const height = 30

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  iconBg,
  iconColor,
  sparklineData,
}: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-2xl', iconBg)}>
          <Icon className={iconColor} size={24} />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-dash-text-soft mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-dash-text">{value}</h3>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={16} className="bg-primary-light" />
          ) : (
            <TrendingDown size={16} className="text-dash-error" />
          )}
          <span
            className={cn(
              'text-sm font-bold',
              isPositive ? 'bg-primary-light' : 'text-dash-error',
            )}
          >
            {change}
          </span>
          <span className="text-xs text-dash-text-muted ml-1">
            from last week
          </span>
        </div>
        <div className="opacity-60">
          <Sparkline
            data={sparklineData}
            color={
              isPositive
                ? 'var(--color-brand-light)'
                : 'var(--color-dash-error)'
            }
          />
        </div>
      </div>
    </div>
  )
}
