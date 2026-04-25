import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationsAR from './ar.json'
import translationsEN from './en.json'
import translationsHE from './he.json'
import translationsRU from './ru.json'

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'he', 'ar']

// Get the path without the language prefix, if present
export const getPathWithoutLang = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean)
  if (!SUPPORTED_LANGUAGES.includes(parts[0])) return pathname
  const rest = parts.slice(1).join('/')
  return rest ? `/${rest}` : '/'
}

// Get saved language from URL or localStorage, default to 'he' if not found
export const getLang = (): string => {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const langPart = parts.find((part) => SUPPORTED_LANGUAGES.includes(part))
  if (langPart) {
    localStorage.setItem('language', langPart)
    return langPart
  }
  return localStorage.getItem('language') || 'he'
}

const initialLang = getLang()

void i18n.use(initReactI18next).init({
  showSupportNotice: false,
  resources: {
    ar: { translation: translationsAR },
    he: { translation: translationsHE },
    en: { translation: translationsEN },
    ru: { translation: translationsRU },
  },
  lng: initialLang,
  fallbackLng: 'he',
})

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof translationsHE
    }
  }
}

export default i18n
