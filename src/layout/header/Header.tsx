import { Layout } from 'antd'
import { useContext, useEffect } from 'react'
import { MenuOutlined } from '@ant-design/icons'
import cn from 'classnames'
import { LayoutContextInterface, LayoutCtx, useHeaderEvent } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import './Header.css'
import ToggleThemeButton from './ToggleThemeButton'
import { DonationButton } from './DonationButton'
import HeaderLinks from './HeaderLinks/HeaderLinks'
import { LanguageToggleButton } from './LanguageToggleButton'

const { Header } = Layout

const MainHeader = () => {
  const { isDarkTheme, toggleTheme } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const { headerEventTriggered } = useHeaderEvent()

  useEffect(() => {
    console.log('Header event triggered:', headerEventTriggered)
    // TODO - continue with any additional logic needed when the header event is triggered
  }, [headerEventTriggered])

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
