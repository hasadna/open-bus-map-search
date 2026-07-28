import { getLang } from './allTranslations'

const setBrowserLanguage = (language: string) => {
  Object.defineProperty(navigator, 'language', { configurable: true, value: language })
}

describe('getLang', () => {
  const originalLanguage = navigator.language

  afterEach(() => {
    localStorage.clear()
    setBrowserLanguage(originalLanguage)
  })

  it('prefers a supported saved language', () => {
    localStorage.setItem('language', 'ru')
    setBrowserLanguage('en-US')

    expect(getLang()).toBe('ru')
  })

  it('falls back to the browser language', () => {
    setBrowserLanguage('ar-EG')

    expect(getLang()).toBe('ar')
  })

  it('ignores an unsupported saved language', () => {
    localStorage.setItem('language', 'fr')
    setBrowserLanguage('en-US')

    expect(getLang()).toBe('en')
  })

  it('defaults to Hebrew when neither language is supported', () => {
    setBrowserLanguage('fr-FR')

    expect(getLang()).toBe('he')
  })
})
