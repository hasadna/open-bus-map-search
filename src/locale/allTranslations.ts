import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationsEN from './en.json'
import translationsHE from './he.json'

i18n.use(initReactI18next).init({
  resources: {
    he: {
      translation: translationsHE,
    },
    en: {
      translation: translationsEN,
    },
  },

  // Default Language
  lng: 'he',
})

export default i18n
