import React from 'react'
import { useTranslation } from 'react-i18next'
import { BulbFilled, BulbOutlined } from '@ant-design/icons'

interface ToggleThemeButtonProps {
  toggleTheme: () => void
  isDarkTheme?: boolean
}

const ToggleThemeButton: React.FC<ToggleThemeButtonProps> = ({ toggleTheme, isDarkTheme }) => {
  const { t } = useTranslation()

  const tooltip_title = isDarkTheme ? t('light_mode_tooltip') : t('dark_mode_tooltip')

  return (
    <button
      className="theme-icon"
      onClick={toggleTheme}
      aria-label={tooltip_title}
      title={tooltip_title}
      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
      {isDarkTheme ? (
        <BulbOutlined style={{ color: '#fff', fontSize: '1.5em' }} />
      ) : (
        <BulbFilled style={{ fontSize: '1.5em' }} />
      )}
    </button>
  )
}

export default ToggleThemeButton
