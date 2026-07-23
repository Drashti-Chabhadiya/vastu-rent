import { Search } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { useTranslation } from '#/context/TranslationContext'

interface ConversationSearchBarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  children?: React.ReactNode
}

export function ConversationSearchBar({
  searchQuery,
  setSearchQuery,
  children,
}: ConversationSearchBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-4 top-[14px] text-muted-dark"
        />
        <Input
          placeholder={t('Search messages...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-11 pr-4 bg-muted-light/80 hover:bg-muted-light border-none rounded-full text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-emerald-500/20"
        />
      </div>
      {children}
    </div>
  )
}
