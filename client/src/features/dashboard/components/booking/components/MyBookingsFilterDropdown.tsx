import { SlidersHorizontal } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

interface Props {
  paymentFilter: 'all' | 'paid' | 'pending'
  onFilterChange: (val: 'all' | 'paid' | 'pending') => void
}

export const MyBookingsFilterDropdown = ({
  paymentFilter,
  onFilterChange,
}: Props) => {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'rounded-full',
            'border-border',
            'text-foreground/80',
            'font-bold',
            'h-10',
            'px-5',
            'flex',
            'items-center',
            'gap-2',
            'hover:bg-muted-light/50',
            'shadow-sm',
            'shrink-0',
            'cursor-pointer',
          )}
        >
          <SlidersHorizontal size={14} className="text-muted-dark" />
          {paymentFilter === 'all'
            ? t('Filter')
            : paymentFilter === 'paid'
              ? t('Paid Bookings')
              : t('Unpaid Bookings')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'bg-card',
          'border-border/30/80',
          'rounded-xl',
          'shadow-lg',
          'p-1',
          'min-w-[160px]',
        )}
      >
        <DropdownMenuItem
          onClick={() => onFilterChange('all')}
          className={cn(
            'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
            paymentFilter === 'all' && 'text-primary bg-primary/5',
          )}
        >
          {t('All Payments')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onFilterChange('paid')}
          className={cn(
            'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
            paymentFilter === 'paid' && 'text-primary bg-primary/5',
          )}
        >
          {t('Paid Bookings')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onFilterChange('pending')}
          className={cn(
            'text-xs font-semibold text-foreground/80 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted-light focus:bg-primary/5 focus:text-primary',
            paymentFilter === 'pending' && 'text-primary bg-primary/5',
          )}
        >
          {t('Pending Payment')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
