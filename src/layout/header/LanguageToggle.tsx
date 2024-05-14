import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { GlobalOutlined } from '@ant-design/icons'

export const LanguageToggle = () => {
  const { t, i18n } = useTranslation()
  const [, handleChangeLanguage] = useReducer((state: string) => {
    const newLanguage = { he: 'en', en: 'he' }[state]
    i18n.changeLanguage(newLanguage)
    return newLanguage!
  }, 'he')

  return (
    <button
      className="header-link"
      onClick={handleChangeLanguage}
      aria-label={t('Change Language')}
      title={t('Change Language')}>
      <GlobalOutlined />
    </button>
  )
}
