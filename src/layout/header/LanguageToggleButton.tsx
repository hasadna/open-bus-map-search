import { GlobalOutlined } from '@ant-design/icons'
import { Dropdown, type MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeContext'

export const LanguageToggleButton = () => {
  const { setLanguage, currentLanguage } = useTheme()
  const { t } = useTranslation()

  const languageOptions: MenuProps['items'] = [
    {
      key: 'he',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇮🇱</span>
          <span>עברית</span>
        </div>
      ),
    },
    {
      key: 'en',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇺🇸</span>
          <span>English</span>
        </div>
      ),
    },
    {
      key: 'ru',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇷🇺</span>
          <span>Русский</span>
        </div>
      ),
    },
  ]

  const handleLanguageChange: MenuProps['onClick'] = ({ key }) => {
    setLanguage(key)
  }

  const getCurrentLanguageFlag = () => {
    switch (currentLanguage) {
      case 'he':
        return '🇮🇱'
      case 'en':
        return '🇺🇸'
      case 'ru':
        return '🇷🇺'
      default:
        return '🌐'
    }
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
        aria-label={t('Change Language')}
        title={t('Change Language')}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>{getCurrentLanguageFlag()}</span>
        <GlobalOutlined />
      </button>
    </Dropdown>
  )
}
