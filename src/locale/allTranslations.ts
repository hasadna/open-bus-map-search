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

// The 'language' localStorage key is also managed by useLocalStorage (usehooks-ts) in
// ThemeContext, which stores values JSON-encoded (e.g. `"he"`). Read/write it in the same
// format here so the useLocalStorage reader doesn't throw "is not valid JSON" on a raw value.
const getStoredLang = (): string | null => {
  const raw = localStorage.getItem('language')
  if (raw == null) return null
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'string' ? parsed : null
  } catch {
    // Legacy raw value written before this fix — migrate it to JSON so the
    // useLocalStorage reader in ThemeContext doesn't choke on it.
    setStoredLang(raw)
    return raw
  }
}

const setStoredLang = (lang: string): void => {
  localStorage.setItem('language', JSON.stringify(lang))
}

// Get saved language from URL or localStorage, default to 'he' if not found
export const getLang = (): string => {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const langPart = parts.find((part) => SUPPORTED_LANGUAGES.includes(part))
  if (langPart) {
    setStoredLang(langPart)
    return langPart
  }
  return (
    getStoredLang() ||
    SUPPORTED_LANGUAGES.find((l) => new Intl.Locale(navigator.language).language === l) ||
    'he'
  )
}

const initialLang = getLang()

i18n.use(initReactI18next).init({
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
