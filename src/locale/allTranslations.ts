import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationsAR from './ar.json'
import translationsEN from './en.json'
import translationsHE from './he.json'
import translationsRU from './ru.json'

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'he', 'ar']

// Prefer the user's saved choice, then the browser locale, and finally Hebrew.
export const getLang = (): string => {
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) return savedLanguage

  const browserLanguage = new Intl.Locale(navigator.language).language
  return SUPPORTED_LANGUAGES.find((language) => language === browserLanguage) || 'he'
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
