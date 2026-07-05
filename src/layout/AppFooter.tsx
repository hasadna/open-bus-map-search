import { Layout } from 'antd'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeContext'
import './AppFooter.scss'

const { Footer } = Layout

const AppFooter = () => {
  const { isDarkTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <Footer className={cn('app-footer', { dark: isDarkTheme })}>
      <span className="hideOnMobile footer-copyright">
        {`${t('homepage.copyright')} ${new Date().getFullYear()}`}
      </span>
    </Footer>
  )
}

export default AppFooter
