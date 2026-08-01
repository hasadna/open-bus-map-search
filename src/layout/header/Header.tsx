import { MenuTwoTone } from '@mui/icons-material'
import { Layout } from 'antd'
import cn from 'classnames'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { DonationButton } from './DonationButton'
import HeaderLinks from './HeaderLinks/HeaderLinks'
import { LanguageToggleButton } from './LanguageToggleButton'
import { Logo } from './Logo'
import { ShareButton } from './ShareButton'
import ToggleThemeButton from './ToggleThemeButton'
import './Header.css'

const { Header } = Layout

const MainHeader = () => {
  const { isDarkTheme, toggleTheme } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const { t } = useTranslation()
  return (
    <Header className={cn('main-header', { dark: isDarkTheme })}>
      <div className="header-brand">
        <button
          className="header-link hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label={t('open_menu_description')}
          title={t('open_menu_description')}>
          <MenuTwoTone fontSize="inherit" />
        </button>
        <Logo />
      </div>
      <HeaderLinks>
        <ShareButton />
        <LanguageToggleButton />
        <ToggleThemeButton toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
        <DonationButton />
      </HeaderLinks>
    </Header>
  )
}

export default MainHeader
