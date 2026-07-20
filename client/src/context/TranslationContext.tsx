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

  const t = (key: TranslationKey | string): string => {
    const dict = translations[language] as Record<string, string>
    return dict[key] || translations.en[key as TranslationKey] || key
  }

  const formatNumber = (val: number | string): string => {
    const num = typeof val === 'number' ? val : parseFloat(String(val))
    if (isNaN(num)) return String(val)
    if (language === 'gu') return num.toLocaleString('gu-IN')
    if (language === 'hi') return num.toLocaleString('hi-IN')
    return num.toLocaleString('en-IN')
  }

  return { language, changeLanguage, t, formatNumber }
}
