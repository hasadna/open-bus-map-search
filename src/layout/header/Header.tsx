import { Layout } from 'antd'
import { useContext } from 'react'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { MenuOutlined } from '@ant-design/icons'
import './Header.css'
import cn from 'classnames'
import ToggleThemeButton from './ToggleThemeButton'
import HeaderLinks from './HeaderLinks/HeaderLinks'

const { Header } = Layout

const MainHeader = () => {
  const { isDarkTheme, toggleTheme } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  return (
    <Header className={cn('main-header', { dark: isDarkTheme })}>
      <MenuOutlined onClick={() => setDrawerOpen(true)} className="hideOnDesktop" />
      <div style={{ flex: 1 }}>&nbsp;</div>
      <ToggleThemeButton toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
      <HeaderLinks />
    </Header>
  )
}

export default MainHeader
