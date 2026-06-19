import { useTheme } from '#/hook'
import { SettingsSectionShell } from './SettingsSectionShell'
import { Sun, Moon, Laptop, CheckCircle2 } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Card } from '#/components/ui/card'

export function ThemeSection() {
  const { theme, setTheme } = useTheme()

  const choices = [
    {
      id: 'light',
      name: 'Light Mode',
      icon: Sun,
      description: 'Sleek paper cream theme with high readability.',
      preview: (
        <div className="relative w-full h-24 rounded-lg overflow-hidden flex flex-col p-2 space-y-1.5 border transition-colors duration-300 bg-light-preview-bg border-light-preview-border">
          {/* Header */}
          <div className="h-3 w-full rounded flex items-center justify-between px-1.5 border bg-light-preview-card border-light-preview-border">
            <span className="h-1 w-10 rounded-xs bg-light-preview-text/20" />
            <span className="h-2 w-2 rounded-full bg-light-preview-primary" />
          </div>
          {/* Main content grid */}
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            <div className="col-span-2 rounded p-1.5 space-y-1 border flex flex-col justify-between bg-light-preview-card border-light-preview-border">
              <div className="space-y-0.5">
                <span className="block h-0.5 w-full rounded-xs bg-light-preview-text/20" />
                <span className="block h-0.5 w-2/3 rounded-xs bg-light-preview-text/10" />
              </div>
              <span className="block h-2 w-8 rounded-xs bg-light-preview-primary" />
            </div>
            <div className="rounded p-1 border flex flex-col justify-between items-center bg-light-preview-card border-light-preview-border">
              <span className="h-4 w-4 rounded-full bg-light-preview-text/10" />
              <span className="h-0.5 w-4 rounded-xs bg-light-preview-text/20" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: Moon,
      description: 'Obsidian emerald dark theme, comfortable on the eyes.',
      preview: (
        <div className="relative w-full h-24 rounded-lg overflow-hidden flex flex-col p-2 space-y-1.5 border transition-colors duration-300 bg-dark-preview-bg border-dark-preview-border">
          {/* Header */}
          <div className="h-3 w-full rounded flex items-center justify-between px-1.5 border bg-dark-preview-card border-dark-preview-border">
            <span className="h-1 w-10 rounded-xs bg-dark-preview-text/20" />
            <span className="h-2 w-2 rounded-full bg-dark-preview-primary" />
          </div>
          {/* Main content grid */}
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            <div className="col-span-2 rounded p-1.5 space-y-1 border flex flex-col justify-between bg-dark-preview-card border-dark-preview-border">
              <div className="space-y-0.5">
                <span className="block h-0.5 w-full rounded-xs bg-dark-preview-text/20" />
                <span className="block h-0.5 w-2/3 rounded-xs bg-dark-preview-text/10" />
              </div>
              <span className="block h-2 w-8 rounded-xs bg-dark-preview-primary" />
            </div>
            <div className="rounded p-1 border flex flex-col justify-between items-center bg-dark-preview-card border-dark-preview-border">
              <span className="h-4 w-4 rounded-full bg-dark-preview-text/10" />
              <span className="h-0.5 w-4 rounded-xs bg-dark-preview-text/20" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'auto',
      name: 'System Default',
      icon: Laptop,
      description: 'Automatically matches your device display mode.',
      preview: (
        <div className="relative w-full h-24 rounded-lg overflow-hidden flex p-1.5 gap-1.5 border transition-colors duration-300 bg-muted/40 border-border/30">
          {/* Left Mini Light Preview */}
          <div className="flex-1 rounded-md border flex flex-col p-1.5 space-y-1 bg-light-preview-bg border-light-preview-border">
            <div className="h-2 w-full rounded-xs flex items-center px-1 border bg-light-preview-card border-light-preview-border">
              <span className="h-0.5 w-6 rounded-xs bg-light-preview-text/20" />
            </div>
            <div className="flex-1 rounded-xs p-1 border flex flex-col justify-between bg-light-preview-card border-light-preview-border">
              <span className="h-0.5 w-full rounded-xs bg-light-preview-text/20" />
              <span className="h-1.5 w-4 rounded-xs bg-light-preview-primary" />
            </div>
          </div>
          {/* Right Mini Dark Preview */}
          <div className="flex-1 rounded-md border flex flex-col p-1.5 space-y-1 bg-dark-preview-bg border-dark-preview-border">
            <div className="h-2 w-full rounded-xs flex items-center px-1 border bg-dark-preview-card border-dark-preview-border">
              <span className="h-0.5 w-6 rounded-xs bg-dark-preview-text/20" />
            </div>
            <div className="flex-1 rounded-xs p-1 border flex flex-col justify-between bg-dark-preview-card border-dark-preview-border">
              <span className="h-0.5 w-full rounded-xs bg-dark-preview-text/20" />
              <span className="h-1.5 w-4 rounded-xs bg-dark-preview-primary" />
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <SettingsSectionShell
      title="Theme & Appearance"
      description="Choose how Vastu-Rent's interface appears on your device. Dark mode extends battery life and reduces eye strain."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {choices.map((choice) => {
          const isActive = theme === choice.id
          const Icon = choice.icon

          return (
            <Card
              key={choice.id}
              role="button"
              tabIndex={0}
              onClick={() => setTheme(choice.id as any)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setTheme(choice.id as any)
                }
              }}
              className={cn(
                'flex flex-col text-left p-4.5 space-y-4 transition-all duration-300 relative group cursor-pointer focus:outline-none bg-card hover:bg-muted-light/20 active:scale-[0.98]',
                isActive
                  ? 'border-primary ring-2 ring-primary/10 shadow-md scale-102 bg-primary/2 dark:bg-primary/2'
                  : 'border-border/40 hover:border-border shadow-xs',
              )}
            >
              {choice.preview}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-black text-foreground">
                    <Icon
                      size={14}
                      className={
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }
                    />
                    {choice.name}
                  </span>
                  {isActive && (
                    <CheckCircle2
                      size={15}
                      className="text-primary fill-primary-soft"
                    />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-muted-foreground/85 leading-relaxed">
                  {choice.description}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </SettingsSectionShell>
  )
}
