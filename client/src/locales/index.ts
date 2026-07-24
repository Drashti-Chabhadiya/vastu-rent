import { en } from './en'
import { gu } from './gu'
import { hi } from './hi'

export const translations = {
  en,
  hi,
  gu,
} as const

export type LanguageCode = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
