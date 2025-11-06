import { GlobalOutlined } from '@ant-design/icons'
import { Dropdown, type MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeContext'

export const LanguageToggleButton = () => {
  const { setLanguage, currentLanguage } = useTheme()
  const { t } = useTranslation()

  const languages = [
    { key: 'he', label: 'עברית' },
    { key: 'en', label: 'English' },
    { key: 'ru', label: 'Русский' },
    { key: 'am', label: 'አማርኛ' },
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
        title={t('change_language')}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <GlobalOutlined />
      </button>
    </Dropdown>
  )
}
