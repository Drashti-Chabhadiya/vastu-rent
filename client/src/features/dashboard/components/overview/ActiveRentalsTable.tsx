import { CalendarDays, ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useTranslation } from '#/context/TranslationContext'

interface Props {
  myRentals: any[] | undefined
  rentalsLoading: boolean
}

export const ActiveRentalsTable = ({ myRentals, rentalsLoading }: Props) => {
  const { t, formatNumber } = useTranslation()

  return (
    <div
      className={cn(
        'xl:col-span-2',
        'bg-card',
        'rounded-[2rem]',
        'border',
        'border-border/30',
        'shadow-sm',
        'p-6',
      )}
    >
      <div className="mb-6">
        <h3 className={cn('text-xl', 'font-black', 'text-foreground')}>
          {t('Active Rented Properties')}
        </h3>
        <p className={cn('text-xs', 'text-muted-foreground/85', 'font-medium')}>
          {t('Timeline of your approved rentals currently active or upcoming.')}
        </p>
      </div>

      {rentalsLoading ? (
        <div className={cn('space-y-4', 'py-8')}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-16',
                'bg-muted-light',
                'rounded-2xl',
                'animate-pulse',
              )}
            />
          ))}
        </div>
      ) : myRentals && myRentals.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/30 hover:bg-transparent">
                <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                  {t('Listing')}
                </TableHead>
                <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                  {t('Landlord')}
                </TableHead>
                <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                  {t('Rental Dates')}
                </TableHead>
                <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider h-auto">
                  {t('Rental Cost')}
                </TableHead>
                <TableHead className="pb-3 font-semibold text-xs text-muted-foreground/70 uppercase tracking-wider text-right h-auto">
                  {t('Status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30 text-sm font-medium text-foreground/80">
              {myRentals.map((rental: any) => (
                <TableRow
                  key={rental.id}
                  className="hover:bg-muted-light/50 transition-colors border-b-0"
                >
                  <TableCell className="py-4">
                    <div className={cn('flex', 'items-center', 'gap-3')}>
                      <img
                        src={
                          rental.product?.images?.[0] ||
                          '/assets/product-placeholder.png'
                        }
                        alt={rental.product?.title}
                        className={cn(
                          'w-10',
                          'h-10',
                          'rounded-xl',
                          'object-cover',
                          'bg-muted/50',
                        )}
                      />
                      <div>
                        <p className={cn('font-bold', 'text-foreground')}>
                          {rental.product?.title}
                        </p>
                        <p
                          className={cn(
                            'text-[10px]',
                            'text-muted-foreground/70',
                            'font-medium',
                          )}
                        >
                          {rental.product?.city || 'India'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-bold text-foreground">
                    {rental.product?.user?.name || 'Lister'}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-semibold text-muted-foreground/85">
                    {new Date(rental.startDate).toLocaleDateString()} -{' '}
                    {new Date(rental.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-4 font-black text-foreground">
                    ₹ {formatNumber(rental.totalPrice || 0)}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider',
                        rental.status === 'pending'
                          ? 'bg-warning text-warning-foreground'
                          : rental.status === 'approved'
                            ? 'bg-primary-soft text-primary'
                            : rental.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-muted/50 text-muted-foreground',
                      )}
                    >
                      {t(rental.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div
          className={cn(
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'py-12',
            'text-center',
            'border',
            'border-dashed',
            'border-border/30',
            'rounded-3xl',
          )}
        >
          <CalendarDays
            size={48}
            className={cn('text-muted-dark', 'mb-4', 'animate-pulse')}
          />
          <h4 className={cn('font-bold', 'text-foreground', 'mb-1')}>
            {t('No active rentals yet')}
          </h4>
          <p
            className={cn(
              'text-xs',
              'text-muted-foreground/85',
              'max-w-xs',
              'mb-4',
            )}
          >
            {t(
              "You haven't rented any property yet. Browse our listings to get started!",
            )}
          </p>
          <Link to="/products">
            <Button
              className={cn(
                'bg-primary',
                'hover:bg-primary/95',
                'text-primary-foreground',
                'font-bold',
                'h-10',
                'px-4',
                'rounded-full',
                'text-xs',
                'flex',
                'items-center',
                'gap-1',
              )}
            >
              {t('Explore Properties')}
              <ArrowUpRight size={14} />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
