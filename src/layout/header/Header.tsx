import { Layout } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useContext } from 'react'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { BulbFilled, BulbOutlined } from '@ant-design/icons'
const { Header } = Layout

const MainHeader = () => {
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const { isDarkTheme, toggleTheme } = useTheme()
  return (
    <Header
      style={{
        background: isDarkTheme ? '#141414' : '#fff',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
      className="_hideOnDesktop">
      <MenuOutlined onClick={() => setDrawerOpen(true)} className="hideOnDesktop" />
      <div style={{ flex: 1 }}>&nbsp;</div>
      <button
        onClick={toggleTheme}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
        {isDarkTheme ? <BulbOutlined style={{ color: '#fff' }} /> : <BulbFilled />}
      </button>
    </Header>
  )
}
export default MainHeader
