import { GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeContext'

export const LanguageToggleButton = () => {
  const { toggleLanguage } = useTheme()
  const { t } = useTranslation()

  return (
    <button
      className="header-link"
      onClick={toggleLanguage}
      aria-label={t('Change Language')}
      title={t('Change Language')}>
      <GlobalOutlined />
    </button>
  )
}
