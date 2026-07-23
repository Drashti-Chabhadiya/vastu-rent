import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useTranslation } from '#/context/TranslationContext'

interface NotificationsPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  formatNumber: (n: number) => string
}

export const NotificationsPagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  formatNumber,
}: NotificationsPaginationProps) => {
  const { t } = useTranslation()

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div
      className={cn(
        'flex',
        'flex-row',
        'items-center',
        'justify-between',
        'px-5',
        'py-3',
        'border-t',
        'border-border/30',
        'gap-2',
      )}
    >
      <p
        className={cn(
          'text-[10px]',
          'font-semibold',
          'text-muted-dark',
        )}
      >
        Showing{' '}
        <span className={cn('font-black', 'text-foreground/80')}>
          {formatNumber(startIndex + 1)}
        </span>{' '}
        to{' '}
        <span className={cn('font-black', 'text-foreground/80')}>
          {formatNumber(Math.min(endIndex, totalItems))}
        </span>{' '}
        of{' '}
        <span className={cn('font-black', 'text-foreground/80')}>
          {formatNumber(totalItems)}
        </span>{' '}
        notifications
      </p>
      <div className={cn('flex', 'items-center', 'gap-1.5')}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className={cn(
            'h-7',
            'px-3',
            'rounded-lg',
            'text-[10px]',
            'font-semibold',
            'border-border',
            'text-muted-foreground',
            'hover:bg-muted-light',
            'shadow-none',
            'cursor-pointer',
            'disabled:opacity-40',
          )}
        >
          {t('Back')}
        </Button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span
              key={`e-${idx}`}
              className={cn(
                'w-7',
                'h-7',
                'flex',
                'items-center',
                'justify-center',
                'text-[10px]',
                'text-muted-dark',
              )}
            >
              …
            </span>
          ) : (
            <Button
              key={`p-${page}`}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={cn(
                'w-7 h-7 rounded-lg text-[10px] font-semibold transition-all cursor-pointer p-0',
                currentPage === page
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-muted-light bg-card',
              )}
            >
              {formatNumber(page as number)}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className={cn(
            'h-7',
            'px-3',
            'rounded-lg',
            'text-[10px]',
            'font-semibold',
            'border-border',
            'text-muted-foreground',
            'hover:bg-muted-light',
            'shadow-none',
            'cursor-pointer',
            'disabled:opacity-40',
          )}
        >
          {t('Next')}
        </Button>
      </div>
    </div>
  )
}
