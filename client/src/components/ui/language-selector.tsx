import { Globe, Check } from 'lucide-react'
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
            'h-9 px-3 gap-2 rounded-xl text-xs font-semibold border-border/60 bg-background/80 hover:bg-muted/80 backdrop-blur-sm transition-all',
            className
          )}
        >
          <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{currentLang.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-lg border-border/50">
        {LANGUAGES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={(e) => {
              e.preventDefault()
              changeLanguage(item.code)
            }}
            className="flex items-center justify-between px-2.5 py-2 text-xs rounded-lg font-medium cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>{item.flag}</span>
              <span>{item.nativeName}</span>
            </span>
            {language === item.code && (
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
