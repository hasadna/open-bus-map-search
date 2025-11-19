import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationsAR from './ar.json'
import translationsEN from './en.json'
import translationsHE from './he.json'
import translationsRU from './ru.json'

// Get saved language from localStorage or default to 'he'
const savedLang =
  typeof window !== 'undefined' && window.localStorage
    ? localStorage.getItem('language') || 'he'
    : 'he'

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: translationsAR },
    he: { translation: translationsHE },
    en: { translation: translationsEN },
    ru: { translation: translationsRU },
  },
  lng: savedLang, // Use saved language or default to Hebrew
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
