import { cn } from '#/lib/utils'
import { ExploreLink } from '#/components/common/ExploreLink'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useTranslation } from '#/context/TranslationContext'

interface RecentListingsTableProps {
  products?: any[]
  isLoading: boolean
  onViewAll?: () => void
}

export const RecentListingsTable = ({
  products = [],
  isLoading,
  onViewAll,
}: RecentListingsTableProps) => {
  const { t, formatCurrency, formatDate } = useTranslation()
  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">{t('Recent Listings')}</h3>
        <ExploreLink onClick={onViewAll}>{t('View All')}</ExploreLink>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/30 hover:bg-transparent">
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase whitespace-nowrap pr-4 h-auto">
                {t('Listing')}
              </TableHead>
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase whitespace-nowrap pr-4 h-auto">
                {t('Category')}
              </TableHead>
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase whitespace-nowrap pr-4 h-auto">
                {t('Provider')}
              </TableHead>
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-center whitespace-nowrap px-4 h-auto">
                {t('Price / Day')}
              </TableHead>
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-center whitespace-nowrap px-4 h-auto">
                {t('Status')}
              </TableHead>
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-right whitespace-nowrap pl-4 h-auto">
                {t('Date')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  {t('Loading...')}
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  {t('No listings found')}
                </TableCell>
              </TableRow>
            ) : (
              products.map((item) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-muted-light/30 transition-colors border-b-0"
                >
                  <TableCell className="py-3 whitespace-nowrap pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80'
                        }
                        alt={item.title}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-xs font-bold text-dash-text">
                        {item.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-dash-text-soft whitespace-nowrap pr-4">
                    {item.category?.name || t('Uncategorized')}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-dash-text-soft whitespace-nowrap pr-4">
                    {item.user?.name || t('Unknown')}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-dash-text text-center whitespace-nowrap px-4">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="py-3 text-center whitespace-nowrap px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-md text-[10px] font-bold',
                        item.isAvailable
                          ? 'bg-primary-soft text-primary'
                          : 'bg-orange-50 text-orange-600',
                      )}
                    >
                      {item.isAvailable ? t('Active') : t('Unavailable')}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-dash-text-muted text-right whitespace-nowrap pl-4">
                    {formatDate(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
