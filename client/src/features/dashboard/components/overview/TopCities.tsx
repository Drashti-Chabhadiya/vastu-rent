import { useTopCities } from '#/hook'
import { MapPin } from 'lucide-react'
import { cn } from "../../../../lib/utils";

export const TopCities = () => {
  const { data: cities = [], isLoading } = useTopCities()

  return (
    <div className={cn('bg-white', 'p-6', 'rounded-2xl', 'border', 'border-gray-100', 'shadow-sm', 'h-full')}>
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-6')}>
        <h3 className={cn('font-bold', 'text-dash-text')}>Top Cities by Listings</h3>
        <button className={cn('text-xs', 'font-bold', 'text-dash-brand', 'hover:underline')}>
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn('flex', 'items-center', 'gap-3', 'animate-pulse')}>
              <div className={cn('h-3', 'w-20', 'bg-gray-100', 'rounded')} />
              <div className={cn('flex-1', 'h-1.5', 'bg-gray-100', 'rounded-full')} />
              <div className={cn('h-3', 'w-10', 'bg-gray-100', 'rounded')} />
            </div>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'py-10', 'text-center')}>
          <MapPin size={36} className={cn('text-gray-200', 'mb-3')} />
          <p className={cn('text-sm', 'font-bold', 'text-gray-400')}>No city data yet</p>
          <p className={cn('text-xs', 'text-gray-300', 'mt-1')}>
            Cities will appear once listings are added with location info.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {cities.map((city) => (
            <div key={city.name} className={cn('flex', 'items-center', 'justify-between', 'group')}>
              <span className={cn('text-xs', 'font-bold', 'text-dash-text-soft', 'w-24', 'truncate')}>
                {city.name}
              </span>
              <div className={cn('flex-1', 'h-1.5', 'bg-gray-100', 'rounded-full', 'overflow-hidden', 'mx-4')}>
                <div
                  className={cn('h-full', 'bg-dash-brand', 'rounded-full', 'transition-all', 'duration-1000', 'group-hover:bg-primary-light')}
                  style={{ width: `${city.percentage}%` }}
                />
              </div>
              <span className={cn('text-xs', 'font-bold', 'text-dash-text', 'text-right', 'w-12')}>
                {city.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
