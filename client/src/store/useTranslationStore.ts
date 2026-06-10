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

function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

function eraseCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

interface TranslationStoreState {
  language: LanguageCode
  setLanguageState: (lang: LanguageCode) => void
  changeLanguage: (lang: LanguageCode) => void
}

export const useTranslationStore = create<TranslationStoreState>((set) => ({
  language: (() => {
    if (typeof window === 'undefined') return 'en'
    const saved = localStorage.getItem('app_language')
    return normalizeLanguage(saved)
  })(),
  setLanguageState: (lang) => set({ language: lang }),
  changeLanguage: (lang) => {
    set({ language: lang })
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang)
      if (lang === 'en') {
        eraseCookie('googtrans')
      } else {
        setCookie('googtrans', `/en/${lang}`)
      }
      window.location.reload()
    }
  },
}))
