import { LanguageTwoTone } from '@mui/icons-material'
import { Dropdown, type MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeContext'

const languages = [
  { key: 'he', label: 'עברית' },
  { key: 'en', label: 'English' },
  { key: 'ru', label: 'Русский' },
  { key: 'ar', label: 'العربية' },
]

const LangLabel = ({ label }: { label: string }) => (
  <div aria-label={label}>
    <span>{label}</span>
  </div>
)

const languageOptions: MenuProps['items'] = languages.map(({ key, label }) => ({
  key,
  label: <LangLabel label={label} />,
}))

export const LanguageToggleButton = () => {
  const { setLanguage, currentLanguage } = useTheme()
  const { t } = useTranslation()

  const handleLanguageChange: MenuProps['onClick'] = ({ key }) => {
    setLanguage(key)
  }

  return (
    <Dropdown
      menu={{
        items: languageOptions,
        onClick: handleLanguageChange,
        selectedKeys: [currentLanguage],
      }}
      trigger={['click']}
      placement="bottomRight">
      <button
        className="header-link"
        aria-label={t('change_language')}
        title={t('change_language')}>
        <LanguageTwoTone fontSize="inherit" />
      </button>
    </Dropdown>
  )
}
