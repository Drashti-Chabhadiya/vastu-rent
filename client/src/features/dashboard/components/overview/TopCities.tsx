import { useTopCities } from '#/hook'
import { MapPin } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { ExploreLink } from '#/components/common/ExploreLink'
import { useTranslation } from '#/context/TranslationContext'

export const TopCities = () => {
  const { t, formatNumber } = useTranslation()
  const { data: cities = [], isLoading } = useTopCities()

  return (
    <div
      className={cn(
        'bg-card',
        'p-6',
        'rounded-2xl',
        'border',
        'border-border/30',
        'shadow-sm',
        'h-full',
      )}
    >
      <div className={cn('flex', 'items-center', 'justify-between', 'mb-6')}>
        <h3 className={cn('font-bold', 'text-dash-text')}>{t('Top Cities')}</h3>
        <ExploreLink to="/products">{t('View All')}</ExploreLink>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn('flex', 'items-center', 'gap-3', 'animate-pulse')}
            >
              <div className={cn('h-3', 'w-20', 'bg-muted/50', 'rounded')} />
              <div
                className={cn('flex-1', 'h-1.5', 'bg-muted/50', 'rounded-full')}
              />
              <div className={cn('h-3', 'w-10', 'bg-muted/50', 'rounded')} />
            </div>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div
          className={cn(
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'py-10',
            'text-center',
          )}
        >
          <MapPin
            size={36}
            className={cn('text-muted-foreground/30', 'mb-3')}
          />
          <p className={cn('text-sm', 'font-bold', 'text-muted-foreground/70')}>
            {t('No city data yet')}
          </p>
          <p className={cn('text-xs', 'text-muted-dark', 'mt-1')}>
            {t(
              'Cities will appear once listings are added with location info.',
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {cities.map((city) => (
            <div
              key={city.name}
              className={cn('flex', 'items-center', 'justify-between', 'group')}
            >
              <span
                className={cn(
                  'text-xs',
                  'font-bold',
                  'text-dash-text-soft',
                  'w-24',
                  'truncate',
                )}
              >
                {city.name}
              </span>
              <div
                className={cn(
                  'flex-1',
                  'h-1.5',
                  'bg-muted/50',
                  'rounded-full',
                  'overflow-hidden',
                  'mx-4',
                )}
              >
                <div
                  className={cn(
                    'h-full',
                    'bg-dash-brand',
                    'rounded-full',
                    'transition-all',
                    'duration-1000',
                    'group-hover:bg-primary-light',
                  )}
                  style={{ width: `${city.percentage}%` }}
                />
              </div>
              <span
                className={cn(
                  'text-xs',
                  'font-bold',
                  'text-dash-text',
                  'text-right',
                  'w-12',
                )}
              >
                {formatNumber(city.count)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
