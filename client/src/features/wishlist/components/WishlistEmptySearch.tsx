import { Search } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

interface WishlistEmptySearchProps {
  searchQuery: string
  onClearSearch: () => void
}

export function WishlistEmptySearch({
  searchQuery,
  onClearSearch,
}: WishlistEmptySearchProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
        <Search size={24} className="text-primary/30" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-1">
        {t('No results for "{query}"').replace('{query}', searchQuery)}
      </h2>
      <p className="text-sm text-muted-foreground/85 mb-4">
        {t('Try adjusting your search terms.')}
      </p>
      <Button
        variant="link"
        onClick={onClearSearch}
        className="text-sm font-bold text-primary hover:text-primary/80 hover:underline transition-colors p-0 h-auto"
      >
        {t('Clear search')}
      </Button>
    </div>
  )
}
