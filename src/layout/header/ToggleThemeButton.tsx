import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ToggleThemeButtonProps {
  toggleTheme: () => void
  isDarkTheme?: boolean
}

const ToggleThemeButton: React.FC<ToggleThemeButtonProps> = ({ toggleTheme, isDarkTheme }) => {
  const { t } = useTranslation()

  const tooltip_title = isDarkTheme ? t('light_mode_tooltip') : t('dark_mode_tooltip')

  return (
    <button
      className="header-link"
      onClick={toggleTheme}
      aria-label={tooltip_title}
      title={tooltip_title}
      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
      {isDarkTheme ? <LightModeIcon className="theme-icon-dark" /> : <DarkModeIcon />}
    </button>
  )
}

export default ToggleThemeButton
