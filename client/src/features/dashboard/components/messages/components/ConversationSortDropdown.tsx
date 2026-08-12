import { SlidersHorizontal, Settings } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '#/components/ui/dropdown-menu'
import { useTranslation } from '#/context/TranslationContext'

export interface ConversationSortDropdownProps {
  sortBy: 'recent' | 'unread' | 'name'
  setSortBy: (val: 'recent' | 'unread' | 'name') => void
  filterOnline: boolean
  setFilterOnline: (v: boolean) => void
  activePanel: 'about' | 'settings'
  showDetailsPanel: boolean
  setActivePanel: (panel: 'about' | 'settings') => void
  setShowDetailsPanel: (show: boolean) => void
}

export function ConversationSortDropdown({
  sortBy,
  setSortBy,
  filterOnline,
  setFilterOnline,
  activePanel,
  showDetailsPanel,
  setActivePanel,
  setShowDetailsPanel,
}: ConversationSortDropdownProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'w-11 h-11 bg-muted-light/80 hover:bg-muted/50 rounded-full text-muted-foreground transition-all cursor-pointer shrink-0 border-none shadow-none',
            (filterOnline || sortBy !== 'recent') &&
              'text-brand-primary-deep bg-emerald-50 hover:bg-emerald-100',
          )}
        >
          <SlidersHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-1.5 rounded-2xl shadow-xl border border-border/30 bg-card"
      >
        <DropdownMenuLabel className="text-xs font-black text-foreground/85 px-3 py-2">
          Sort Conversations
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sortBy}
          onValueChange={(val: any) => setSortBy(val)}
        >
          <DropdownMenuRadioItem
            value="recent"
            className="rounded-xl text-[11px] font-bold py-2 px-3 pl-8 cursor-pointer"
          >
            Recent Activity
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="unread"
            className="rounded-xl text-[11px] font-bold py-2 px-3 pl-8 cursor-pointer"
          >
            Unread Messages First
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="name"
            className="rounded-xl text-[11px] font-bold py-2 px-3 pl-8 cursor-pointer"
          >
            Name (A to Z)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator className="my-1 border-border/10" />

        <DropdownMenuLabel className="text-xs font-black text-foreground/85 px-3 py-2">
          Filters
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filterOnline}
          onCheckedChange={setFilterOnline}
          className="rounded-xl text-[11px] font-bold py-2 px-3 pl-8 cursor-pointer"
        >
          Online/Active Only
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator className="my-1 border-border/10" />
        <DropdownMenuItem
          onClick={() => {
            const isOpening = activePanel !== 'settings' || !showDetailsPanel
            setActivePanel(isOpening ? 'settings' : 'about')
            setShowDetailsPanel(isOpening)
          }}
          className="rounded-xl text-[11px] font-bold py-2 px-3 text-foreground/90 cursor-pointer flex items-center"
        >
          <Settings size={13} className="mr-2" />
          <span>{t('Chat Settings')}</span>
        </DropdownMenuItem>

        {(filterOnline || sortBy !== 'recent') && (
          <>
            <DropdownMenuSeparator className="my-1 border-border/10" />
            <DropdownMenuItem
              onClick={() => {
                setSortBy('recent')
                setFilterOnline(false)
              }}
              className="rounded-xl text-[11px] font-black py-2 px-3 justify-center text-primary hover:bg-primary-soft cursor-pointer text-center"
            >
              Clear All Filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
