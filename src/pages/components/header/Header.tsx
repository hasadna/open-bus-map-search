import { Layout } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useContext } from 'react'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'

const { Header } = Layout

const MainHeader = () => {
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  return (
    <Header style={{ background: 'white' }} className="hideOnDesktop">
      <MenuOutlined onClick={() => setDrawerOpen(true)} />
    </Header>
  )
}
export default MainHeader
