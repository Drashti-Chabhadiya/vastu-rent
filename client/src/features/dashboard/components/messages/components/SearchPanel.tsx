import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { useChatStore } from '../../../../../store/useChatStore'

export function SearchPanel() {
  const {
    searchText,
    setSearchText,
    currentMatchIndex,
    setCurrentMatchIndex,
    messages,
    setShowConversationSearch,
  } = useChatStore()

  // Calculate search matches internally
  const searchMatches = messages.filter(
    (m) =>
      !m.isDeleted &&
      m.content &&
      m.content.toLowerCase().includes(searchText.toLowerCase()) &&
      searchText.trim() !== '',
  )

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-yellow-200/40', 'transition-all', 'duration-500')
      setTimeout(() => {
        el.classList.remove('bg-yellow-200/40')
      }, 2000)
    }
  }

  const handleSearchNavigate = (direction: 'up' | 'down') => {
    if (searchMatches.length === 0) return
    let nextIndex = currentMatchIndex
    if (direction === 'up') {
      nextIndex = currentMatchIndex > 0 ? currentMatchIndex - 1 : searchMatches.length - 1
    } else {
      nextIndex = currentMatchIndex < searchMatches.length - 1 ? currentMatchIndex + 1 : 0
    }
    setCurrentMatchIndex(nextIndex)
    scrollToMessage(searchMatches[nextIndex].id)
  }

  return (
    <div className="px-6 py-2.5 border-b border-border/20 bg-muted-light/35 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top duration-200">
      <div className="relative flex-1">
        <Search size={13} className="absolute left-3 top-3 text-muted-dark" />
        <Input
          placeholder="Search in this chat..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value)
            setCurrentMatchIndex(0)
          }}
          className="h-10 pl-9 pr-24 bg-card border-none rounded-xl text-[11px] font-bold focus-visible:ring-1 focus-visible:ring-primary/20"
        />
        {searchText.trim() !== "" && (
          <span className="absolute right-3 top-3 text-[10px] font-bold text-muted-dark bg-muted-light px-2 py-0.5 rounded-md">
            {searchMatches.length > 0 ? `${currentMatchIndex + 1} of ${searchMatches.length}` : 'No matches'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={searchMatches.length === 0}
          onClick={() => handleSearchNavigate('up')}
          className="w-8 h-8 hover:bg-muted-light text-muted-dark hover:text-foreground rounded-lg cursor-pointer shrink-0"
          title="Previous match"
        >
          <ChevronUp size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={searchMatches.length === 0}
          onClick={() => handleSearchNavigate('down')}
          className="w-8 h-8 hover:bg-muted-light text-muted-dark hover:text-foreground rounded-lg cursor-pointer shrink-0"
          title="Next match"
        >
          <ChevronDown size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowConversationSearch(false)
            setSearchText('')
            setCurrentMatchIndex(0)
          }}
          className="w-8 h-8 hover:bg-muted-light text-muted-dark hover:text-foreground rounded-lg cursor-pointer shrink-0"
          title="Close search"
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  )
}

