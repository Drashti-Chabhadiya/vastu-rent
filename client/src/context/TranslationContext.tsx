import React, { useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { useTranslationStore } from '#/store/useTranslationStore'
import { translations, type LanguageCode, type TranslationKey } from '#/locales'

export { translations, type LanguageCode }

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
}

export function normalizeLanguage(
  lang: string | null | undefined,
): LanguageCode {
  if (!lang) return 'en'
  const lower = lang.toLowerCase()
  if (lower === 'hi' || lower === 'hindi') return 'hi'
  if (lower === 'gu' || lower === 'gujarati') return 'gu'
  return 'en'
}

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = authClient.useSession()
  const language = useTranslationStore((state) => state.language)
  const setLanguageState = useTranslationStore(
    (state) => state.setLanguageState,
  )

  // Keep state in sync with authenticated user preference on session change
  useEffect(() => {
    if (session?.user) {
      const userLang = (session.user as any).language
      if (userLang) {
        const normalized = normalizeLanguage(userLang)
        if (normalized !== language) {
          setLanguageState(normalized)
          localStorage.setItem('app_language', normalized)
        }
      }
    }
  }, [session, language, setLanguageState])

  return <>{children}</>
}

export function useTranslation() {
  const language = useTranslationStore((state) => state.language)
  const changeLanguage = useTranslationStore((state) => state.changeLanguage)

  const locale = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'

  const t = (key: TranslationKey | string): string => {
    if (!key) return ''
    const dict = translations[language] as Record<string, string>
    return dict[key] || translations.en[key as TranslationKey] || key
  }

  const numberingOptions =
    language === 'gu'
      ? { numberingSystem: 'gujr' }
      : language === 'hi'
        ? { numberingSystem: 'deva' }
        : {}

  const formatNumber = (val: number | string): string => {
    if (val === null || val === undefined || val === '') return ''
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''))
    if (isNaN(num)) return String(val)
    return num.toLocaleString(locale, numberingOptions)
  }

  const formatCurrency = (val: number | string): string => {
    if (val === null || val === undefined || val === '') return '₹0'
    const cleanStr = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleanStr)
    if (isNaN(num)) return String(val)
    return `₹${num.toLocaleString(locale, numberingOptions)}`
  }

  const formatDate = (dateVal: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateVal) return ''
    const date = new Date(dateVal)
    if (isNaN(date.getTime())) return String(dateVal)
    return date.toLocaleDateString(locale, { ...numberingOptions, ...(options || { year: 'numeric', month: 'short', day: 'numeric' }) })
  }

  return { language, changeLanguage, t, formatNumber, formatCurrency, formatDate }
}
