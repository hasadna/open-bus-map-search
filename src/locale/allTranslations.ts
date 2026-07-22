import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationsAR from './ar.json'
import translationsEN from './en.json'
import translationsHE from './he.json'
import translationsRU from './ru.json'

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'he', 'ar']

// Resolve the language from localStorage, then the browser locale, defaulting
// to 'he'. The URL no longer carries a language prefix; legacy prefixed links
// are handled by LegacyLangRedirect, which persists the language here.
export const getLang = (): string => {
  return (
    localStorage.getItem('language') ||
    SUPPORTED_LANGUAGES.find((l) => new Intl.Locale(navigator.language).language === l) ||
    'he'
  )
}

const initialLang = getLang()

i18n.use(initReactI18next).init({
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
