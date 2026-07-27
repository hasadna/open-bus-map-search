import { act, render, screen } from '@testing-library/react'
import i18n from 'src/locale/allTranslations'
import { AfterMidnightHint } from './AfterMidnightHint'

// The hint must re-render on a language switch. Reading the string through
// useTranslation is what subscribes the component to i18next's languageChanged
// event — a bare <Trans> does not, and leaves the text frozen in the language
// that happened to be active on first render.
describe('AfterMidnightHint', () => {
  const setLanguage = async (lng: string) => {
    await act(async () => {
      await i18n.changeLanguage(lng)
    })
  }

  afterEach(() => setLanguage('he'))

  it('renders the hint in the active language', async () => {
    await setLanguage('he')
    render(<AfterMidnightHint />)

    expect(screen.getByText(/נסיעות שיצאו אחרי חצות/)).toBeInTheDocument()
  })

  it('re-renders in the new language when the language changes', async () => {
    await setLanguage('he')
    render(<AfterMidnightHint />)

    await setLanguage('en')
    expect(screen.getByText(/Rides after midnight/)).toBeInTheDocument()
    expect(screen.queryByText(/נסיעות שיצאו אחרי חצות/)).not.toBeInTheDocument()

    await setLanguage('he')
    expect(screen.getByText(/נסיעות שיצאו אחרי חצות/)).toBeInTheDocument()
  })

  // ar/ru have no translation for this key yet, so i18next serves the he
  // fallback rather than the raw key. Documented, not desired.
  it('falls back to Hebrew for the untranslated languages', async () => {
    await setLanguage('ar')
    render(<AfterMidnightHint />)

    expect(screen.getByText(/נסיעות שיצאו אחרי חצות/)).toBeInTheDocument()
  })
})
