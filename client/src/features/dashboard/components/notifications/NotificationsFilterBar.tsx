import { Search } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useTranslation } from '#/context/TranslationContext'

interface NotificationsFilterBarProps {
  search: string
  onSearchChange: (val: string) => void
  filterType: string
  onFilterTypeChange: (val: string) => void
}

export const NotificationsFilterBar = ({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
}: NotificationsFilterBarProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex',
        'items-center',
        'gap-3',
        'p-5',
        'border-b',
        'border-border/30',
      )}
    >
      <div className={cn('relative', 'flex-1')}>
        <Search
          size={13}
          className={cn('absolute', 'left-3', 'top-[11px]', 'text-muted-dark')}
        />
        <Input
          placeholder={t('Search listings...')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'h-9',
            'pl-9',
            'pr-4',
            'bg-muted-light',
            'border-none',
            'rounded-xl',
            'text-[11px]',
            'font-semibold',
            'focus-visible:ring-1',
            'focus-visible:ring-primary/20',
          )}
        />
      </div>
      <Select value={filterType} onValueChange={onFilterTypeChange}>
        <SelectTrigger
          className={cn(
            'w-[130px]',
            'h-9',
            'bg-muted-light',
            'border-none',
            'rounded-xl',
            'text-[11px]',
            'font-semibold',
            'text-muted-foreground',
            'focus:ring-1',
            'focus:ring-primary/20',
            'shadow-none',
            'cursor-pointer',
          )}
        >
          <SelectValue placeholder={t('All Statuses')} />
        </SelectTrigger>
        <SelectContent
          className={cn('rounded-xl', 'border-border/30', 'shadow-lg', 'p-1')}
        >
          <SelectItem
            value="all"
            className={cn(
              'text-[11px]',
              'font-semibold',
              'rounded-lg',
              'cursor-pointer',
            )}
          >
            {t('All Statuses')}
          </SelectItem>
          <SelectItem
            value="unread"
            className={cn(
              'text-[11px]',
              'font-semibold',
              'rounded-lg',
              'cursor-pointer',
            )}
          >
            {t('Unread Alerts')}
          </SelectItem>
          <SelectItem
            value="booking"
            className={cn(
              'text-[11px]',
              'font-semibold',
              'rounded-lg',
              'cursor-pointer',
            )}
          >
            {t('Booking Requests')}
          </SelectItem>
          <SelectItem
            value="payment"
            className={cn(
              'text-[11px]',
              'font-semibold',
              'rounded-lg',
              'cursor-pointer',
            )}
          >
            {t('Earnings Payouts')}
          </SelectItem>
          <SelectItem
            value="alert"
            className={cn(
              'text-[11px]',
              'font-semibold',
              'rounded-lg',
              'cursor-pointer',
            )}
          >
            {t('Platform Alerts')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
