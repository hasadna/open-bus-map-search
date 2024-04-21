import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { GlobalOutlined } from '@ant-design/icons'

export const LanguageToggle = () => {
  const { i18n } = useTranslation()
  const [, handleChangeLanguage] = useReducer((state: string) => {
    const newLanguage = { he: 'en', en: 'he' }[state]
    i18n.changeLanguage(newLanguage)
    return newLanguage!
  }, 'he')

  return (
    <button
      className="theme-icon"
      onClick={handleChangeLanguage}
      aria-label={i18n.language === 'he' ? 'English' : 'עברית'}
      title={i18n.language === 'he' ? 'English' : 'עברית'}
      style={{ margin: '1em', border: 'none', background: 'transparent', cursor: 'pointer' }}>
      <GlobalOutlined style={{ fontSize: '1.7em' }} />
    </button>
  )
}
