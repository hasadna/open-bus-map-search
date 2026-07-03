import { MenuTwoTone } from '@mui/icons-material'
import { Layout } from 'antd'
import cn from 'classnames'
import { useContext } from 'react'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { DonationButton } from './DonationButton'
import HeaderLinks from './HeaderLinks/HeaderLinks'
import { LanguageToggleButton } from './LanguageToggleButton'
import { ShareButton } from './ShareButton'
import ToggleThemeButton from './ToggleThemeButton'
import './Header.css'

const { Header } = Layout

const MainHeader = () => {
  const { isDarkTheme, toggleTheme } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  return (
    <Header className={cn('main-header', { dark: isDarkTheme })}>
      <MenuTwoTone
        fontSize="inherit"
        onClick={() => setDrawerOpen(true)}
        className="hideOnDesktop"
      />
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
