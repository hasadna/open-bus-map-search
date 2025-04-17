import { BulbFilled, BulbOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

interface ToggleThemeButtonProps {
  toggleTheme: () => void
  isDarkTheme?: boolean
}

const ToggleThemeButton = ({ toggleTheme, isDarkTheme }: ToggleThemeButtonProps) => {
  const { t } = useTranslation()

  const tooltip_title = isDarkTheme ? t('light_mode_tooltip') : t('dark_mode_tooltip')

  return (
    <button
      className="header-link"
      onClick={toggleTheme}
      aria-label={tooltip_title}
      title={tooltip_title}
      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
      {isDarkTheme ? <BulbOutlined className="bulb-dark" /> : <BulbFilled />}
    </button>
  )
}

export default ToggleThemeButton
