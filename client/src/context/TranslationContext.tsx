import React, { useEffect } from 'react'
import { useSessionContext } from '#/context/SessionContext'
import { useTranslationStore } from '#/store/useTranslationStore'
import { translations } from '#/locales'
import type { LanguageCode, TranslationKey } from '#/locales'

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

// Numeral conversion maps
const DEVA_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
const GUJR_DIGITS = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯']
const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const DIGIT_TO_INDEX: Record<string, number> = {}
EN_DIGITS.forEach((ch, i) => {
  DIGIT_TO_INDEX[ch] = i
})
DEVA_DIGITS.forEach((ch, i) => {
  DIGIT_TO_INDEX[ch] = i
})
GUJR_DIGITS.forEach((ch, i) => {
  DIGIT_TO_INDEX[ch] = i
})

const ALL_DIGITS_REGEX = /[0-9०-९૦-૯]/g

export function convertDigits(
  text: string | number | null | undefined,
  targetLang: LanguageCode,
): string {
  if (text === null || text === undefined) return ''
  const str = String(text)
  if (!str) return ''
  const targetMap =
    targetLang === 'hi'
      ? DEVA_DIGITS
      : targetLang === 'gu'
        ? GUJR_DIGITS
        : EN_DIGITS
  return str.replace(ALL_DIGITS_REGEX, (match) => {
    const idx = DIGIT_TO_INDEX[match]
    return idx !== undefined ? targetMap[idx] : match
  })
}

const IGNORED_TAGS = new Set([
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'OPTION',
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'NOSCRIPT',
])

function shouldSkipNode(node: Node): boolean {
  let parent = node.parentElement
  while (parent) {
    if (IGNORED_TAGS.has(parent.tagName)) return true
    if (parent.isContentEditable) return true
    if (parent.getAttribute('data-no-digit-convert') === 'true') return true
    parent = parent.parentElement
  }
  return false
}

function processTextNode(node: Text, lang: LanguageCode) {
  if (shouldSkipNode(node)) return
  const val = node.nodeValue
  if (!val || !ALL_DIGITS_REGEX.test(val)) return
  const converted = convertDigits(val, lang)
  if (converted !== val) {
    node.nodeValue = converted
  }
}

function walkAndConvert(root: Node, lang: LanguageCode) {
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT
      return ALL_DIGITS_REGEX.test(node.nodeValue || '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP
    },
  })

  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((node) => processTextNode(node, lang))
}

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSessionContext()
  const language = useTranslationStore((state) => state.language)
  const setLanguageState = useTranslationStore(
    (state) => state.setLanguageState,
  )

  // Sync state with authenticated user preference on session change
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

  // Automatically process & observe all text nodes in document for digit language conversion
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    // Convert existing DOM tree
    walkAndConvert(document.body, language)

    // Set up MutationObserver to convert newly inserted or updated text nodes dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'characterData' &&
          mutation.target.nodeType === Node.TEXT_NODE
        ) {
          processTextNode(mutation.target as Text, language)
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              processTextNode(node as Text, language)
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              walkAndConvert(node, language)
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [language])

  return <>{children}</>
}

export function useTranslation() {
  const language = useTranslationStore((state) => state.language)
  const changeLanguage = useTranslationStore((state) => state.changeLanguage)

  const locale =
    language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'

  const numberingOptions =
    language === 'gu'
      ? { numberingSystem: 'gujr' }
      : language === 'hi'
        ? { numberingSystem: 'deva' }
        : {}

  const formatDigits = (val: string | number | null | undefined): string => {
    return convertDigits(val, language)
  }

  const t = (
    key: TranslationKey | string,
    params?: Record<string, string | number>,
  ): string => {
    if (!key) return ''
    const dict = translations[language] as Record<string, string>
    let text = dict[key] || translations.en[key as TranslationKey] || key

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        const formattedVal =
          typeof v === 'number' ? formatNumber(v) : formatDigits(v)
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), formattedVal)
      })
    }

    return formatDigits(text)
  }

  const formatNumber = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '') return ''
    const cleanStr = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleanStr)
    if (isNaN(num)) return formatDigits(val)
    const formatted = num.toLocaleString(locale, numberingOptions)
    return formatted
  }

  const formatCurrency = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '')
      return formatDigits('₹0')
    const cleanStr = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleanStr)
    if (isNaN(num)) return formatDigits(val)
    const formattedNum = num.toLocaleString(locale, numberingOptions)
    return `₹${formattedNum}`
  }

  const formatDate = (
    dateVal: Date | string | number | null | undefined,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    if (!dateVal) return ''
    const date = new Date(dateVal)
    if (isNaN(date.getTime())) return formatDigits(String(dateVal))
    return date.toLocaleDateString(locale, {
      ...numberingOptions,
      ...(options || { year: 'numeric', month: 'short', day: 'numeric' }),
    })
  }

  return {
    language,
    changeLanguage,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    formatDigits,
  }
}
