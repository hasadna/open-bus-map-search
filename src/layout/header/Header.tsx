import { Layout } from 'antd'
import { useContext } from 'react'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { BulbFilled, BulbOutlined, MenuOutlined } from '@ant-design/icons'
import GitHubLink from './GitHubLink/GitHubLink'
import './Header.css'
import cn from 'classnames'
const { Header } = Layout

const MainHeader = () => {
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const { isDarkTheme, toggleTheme } = useTheme()
  return (
    <Header className={cn('main-header', { dark: isDarkTheme })}>
      <MenuOutlined onClick={() => setDrawerOpen(true)} className="hideOnDesktop" />
      <div style={{ flex: 1 }}>&nbsp;</div>
      <GitHubLink />
      <button
        className="theme-icon"
        onClick={toggleTheme}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
        {isDarkTheme ? (
          <BulbOutlined style={{ color: '#fff', fontSize: '1.5em' }} />
        ) : (
          <BulbFilled style={{ fontSize: '1.5em' }} />
        )}
      </button>
    </Header>
  )
}
export default MainHeader
