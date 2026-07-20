import { create } from 'zustand'

export type LanguageCode = 'en' | 'hi' | 'gu'

export function normalizeLanguage(
  lang: string | null | undefined,
): LanguageCode {
  if (!lang) return 'en'
  const lower = lang.toLowerCase()
  if (lower === 'hi' || lower === 'hindi') return 'hi'
  if (lower === 'gu' || lower === 'gujarati') return 'gu'
  return 'en'
}

function eraseCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  document.cookie =
    name +
    '=; Path=/; Domain=' +
    window.location.hostname +
    '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

interface TranslationStoreState {
  language: LanguageCode
  setLanguageState: (lang: LanguageCode) => void
  changeLanguage: (lang: LanguageCode) => void
}

export const useTranslationStore = create<TranslationStoreState>((set) => ({
  language: (() => {
    if (typeof window === 'undefined') return 'en'
    eraseCookie('googtrans')
    const saved = localStorage.getItem('app_language')
    return normalizeLanguage(saved)
  })(),
  setLanguageState: (lang) => set({ language: lang }),
  changeLanguage: (lang) => {
    set({ language: lang })
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang)
      eraseCookie('googtrans')
    }
  },
}))
