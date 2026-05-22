import React, { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Search, X } from 'lucide-react'
import { cn } from '#/lib/utils'

interface IconSelectorProps {
  selectedIcon?: string
  onSelect: (iconName: string) => void
}

// Filter out non-icon exports from lucide-react and ensure they are PascalCase (likely icons)
const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(
  (name) =>
    (name !== 'createLucideIcon' &&
      name !== 'default' &&
      /^[A-Z]/.test(name) && // Icons usually start with uppercase
      typeof (LucideIcons as any)[name] === 'function') ||
    (LucideIcons as any)[name]?.render,
)

export const IconSelector = ({ selectedIcon, onSelect }: IconSelectorProps) => {
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()
    if (!searchTerm) return ALL_ICON_NAMES.slice(0, 100)

    return ALL_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(searchTerm),
    ).slice(0, 300)
  }, [search])

  const renderIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name]
    if (!IconComponent) return null
    try {
      return <IconComponent size={20} strokeWidth={2} />
    } catch (e) {
      return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
          size={16}
        />
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-white border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-dash-brand/20 transition-all"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-8 w-8 rounded-full p-0 active:scale-[0.98] transition-all cursor-pointer hover:bg-gray-100/50"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
        {filteredIcons.map((name) => (
          <Button
            key={name}
            type="button"
            variant="ghost"
            onClick={() => onSelect(name)}
            title={name}
            className={cn(
              'aspect-square p-0 flex items-center justify-center rounded-xl border transition-all hover:bg-dash-brand/5 hover:border-dash-brand/30 hover:text-dash-brand active:scale-[0.98] group min-w-0 min-h-0 h-auto w-auto',
              selectedIcon === name
                ? 'bg-dash-brand/10 border-dash-brand text-dash-brand shadow-sm hover:bg-dash-brand/15'
                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50',
            )}
          >
            <div
              className={cn(
                'transition-transform group-hover:scale-110',
                selectedIcon === name ? 'scale-110' : '',
              )}
            >
              {renderIcon(name)}
            </div>
          </Button>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No icons found for "{search}"
        </div>
      )}
    </div>
  )
}
