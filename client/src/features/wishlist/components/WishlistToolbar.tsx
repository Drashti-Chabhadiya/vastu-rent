import { useState, useRef, useEffect } from 'react'
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Grid3X3,
  List,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useTranslation } from '#/context/TranslationContext'

interface WishlistToolbarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'name'
  onSortChange: (val: 'default' | 'price-asc' | 'price-desc' | 'name') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (val: 'grid' | 'list') => void
}

export function WishlistToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: WishlistToolbarProps) {
  const { t } = useTranslation()
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none"
        />
        <Input
          type="text"
          placeholder={t('Search saved items…')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 pl-10 pr-9 rounded-2xl bg-card border border-border/30 shadow-sm text-sm font-medium text-foreground/90 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
        {searchQuery && (
          <Button
            onClick={() => onSearchChange('')}
            variant="ghost"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 p-0 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground/70 transition-colors active:scale-95"
          >
            <X size={11} />
          </Button>
        )}
      </div>

      <div ref={sortRef} className="relative">
        <Button
          variant="ghost"
          onClick={() => setIsSortOpen((v) => !v)}
          className={`h-11 pl-3.5 pr-3.5 rounded-2xl bg-card border shadow-sm text-sm font-bold flex items-center gap-2.5 min-w-[180px] justify-between transition-all hover:bg-transparent ${
            isSortOpen
              ? 'border-primary/40 ring-2 ring-primary/20 text-primary'
              : 'border-border/30 text-foreground/80 hover:border-primary/30 hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={14}
              className="text-primary/60 shrink-0"
            />
            <span>
              {sortBy === 'default'
                ? t('Default Order')
                : sortBy === 'name'
                  ? t('Name A–Z')
                  : sortBy === 'price-asc'
                    ? t('Price: Low → High')
                    : t('Price: High → Low')}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-muted-foreground/70 transition-transform duration-200 shrink-0 ${
              isSortOpen ? 'rotate-180 text-primary' : ''
            }`}
          />
        </Button>

        {isSortOpen && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/30 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            {(
              [
                { value: 'default', label: t('Default Order') },
                { value: 'name', label: t('Name A–Z') },
                { value: 'price-asc', label: t('Price: Low → High') },
                { value: 'price-desc', label: t('Price: High → Low') },
              ] as const
            ).map((opt) => (
              <Button
                variant="ghost"
                key={opt.value}
                onClick={() => {
                  onSortChange(opt.value)
                  setIsSortOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors rounded-none justify-start ${
                  sortBy === opt.value
                    ? 'text-primary bg-primary/5 hover:bg-primary/5 hover:text-primary'
                    : 'text-foreground/80 hover:bg-muted-light hover:text-foreground'
                }`}
              >
                <span>{opt.label}</span>
                {sortBy === opt.value && (
                  <Check
                    size={13}
                    className="text-primary shrink-0 ml-auto"
                  />
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 bg-card border border-border/30 shadow-sm p-1 rounded-2xl">
        <Button
          variant="ghost"
          onClick={() => onViewModeChange('grid')}
          className={`p-2 h-auto rounded-xl transition-all ${
            viewMode === 'grid'
              ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
              : 'text-muted-foreground/70 hover:text-primary hover:bg-primary/5'
          }`}
          title={t('Grid view')}
        >
          <Grid3X3 size={15} />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onViewModeChange('list')}
          className={`p-2 h-auto rounded-xl transition-all ${
            viewMode === 'list'
              ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
              : 'text-muted-foreground/70 hover:text-primary hover:bg-primary/5'
          }`}
          title={t('List view')}
        >
          <List size={15} />
        </Button>
      </div>
    </div>
  )
}
