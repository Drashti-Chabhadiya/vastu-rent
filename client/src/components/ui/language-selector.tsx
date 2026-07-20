import { Globe, Check, ChevronDown } from 'lucide-react'
import { useTranslation, type LanguageCode } from '#/context/TranslationContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
}

const LANGUAGES: { code: LanguageCode; label: string; nativeName: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
]

export function LanguageSelector({ variant = 'outline', className }: LanguageSelectorProps) {
  const { language, changeLanguage } = useTranslation()

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="sm"
          className={cn(
            'h-9 px-3 gap-2 rounded-full text-xs font-bold border border-border/60 bg-card/90 text-foreground hover:bg-muted hover:border-primary/40 shadow-xs backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer',
            className
          )}
        >
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Globe className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-[13px]">{currentLang.nativeName}</span>
          <ChevronDown className="h-3 w-3 opacity-50 shrink-0 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl p-1.5 shadow-xl border border-border/50 bg-card/95 backdrop-blur-xl animate-in fade-in-80 zoom-in-95 duration-150"
      >
        <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
          Language / ભાષા
        </div>
        {LANGUAGES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={(e) => {
              e.preventDefault()
              changeLanguage(item.code)
            }}
            className={cn(
              'flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold cursor-pointer transition-all duration-150 my-0.5',
              language === item.code
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-foreground/90 hover:bg-muted hover:text-primary'
            )}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">{item.flag}</span>
              <span>{item.nativeName}</span>
            </span>
            {language === item.code && (
              <Check className="h-3.5 w-3.5 text-primary shrink-0 stroke-[2.5]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
