import { useTheme } from '#/hook'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { Sun, Moon, Laptop, Check } from 'lucide-react'
import { cn } from '#/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all active:scale-95 cursor-pointer',
          )}
          aria-label="Toggle Theme"
        >
          {theme === 'light' && <Sun className="h-5 w-5 text-foreground animate-in fade-in zoom-in duration-250" />}
          {theme === 'dark' && <Moon className="h-5 w-5 text-foreground animate-in fade-in zoom-in duration-250" />}
          {theme === 'auto' && <Laptop className="h-5 w-5 text-foreground animate-in fade-in zoom-in duration-250" />}
          <span className="sr-only">Toggle Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-36 p-1.5 rounded-2xl bg-card border border-border shadow-lg"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 shrink-0" />
            <span>Light</span>
          </div>
          {theme === 'light' && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 shrink-0" />
            <span>Dark</span>
          </div>
          {theme === 'dark' && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('auto')}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 shrink-0" />
            <span>System</span>
          </div>
          {theme === 'auto' && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
