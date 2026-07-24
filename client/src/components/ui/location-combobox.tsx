import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useLocations } from '#/hook'

interface LocationComboboxProps {
  type: 'country' | 'state' | 'city'
  value: string
  onChange: (value: string, id?: number) => void
  parentId?: number // countryId for state, stateId for city
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function LocationCombobox({
  type,
  value,
  onChange,
  parentId,
  placeholder,
  disabled,
  className,
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: items = [], isLoading } = useLocations(
    {
      type,
      parentId,
      search: debouncedSearch,
    },
    {
      enabled: type === 'country' || !!parentId,
    },
  )

  // If value is a known name and we don't have it in the list yet, we don't strictly need it in the dropdown since value is controlled.

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-[14px] font-normal focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all justify-between',
            !value && 'text-muted-foreground/60',
            className,
          )}
        >
          {value || placeholder || `Select ${type}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${type}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Searching...' : `No ${type} found.`}
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onChange(item.name, item.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.name ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
