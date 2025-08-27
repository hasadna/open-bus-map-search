import { MenuOutlined } from '@ant-design/icons'
import { Layout } from 'antd'
import cn from 'classnames'
import { useContext } from 'react'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { DonationButton } from './DonationButton'
import './Header.css'
import HeaderLinks from './HeaderLinks/HeaderLinks'
import { LanguageToggleButton } from './LanguageToggleButton'
import ToggleThemeButton from './ToggleThemeButton'

const { Header } = Layout

const MainHeader = () => {
  const { isDarkTheme, toggleTheme } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  return (
    <Header className={cn('main-header', { dark: isDarkTheme })}>
      <MenuOutlined onClick={() => setDrawerOpen(true)} className="hideOnDesktop" />
      <HeaderLinks>
        <LanguageToggleButton />
        <ToggleThemeButton toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
        <DonationButton />
      </HeaderLinks>
    </Header>
  )
}

export default MainHeader
