import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'react-i18next'

interface ToggleThemeButtonProps {
  toggleTheme: () => void
  isDarkTheme?: boolean
}

const ToggleThemeButton = ({ toggleTheme, isDarkTheme }: ToggleThemeButtonProps) => {
  const { t } = useTranslation()

  const tooltip_title = isDarkTheme ? t('light_mode_tooltip') : t('dark_mode_tooltip')

  return (
    <IconButton size="small" onClick={toggleTheme} aria-label={tooltip_title} title={tooltip_title}>
      {isDarkTheme ? <LightModeIcon fontSize="inherit" /> : <DarkModeIcon fontSize="inherit" />}
    </IconButton>
  )
}

export default ToggleThemeButton
