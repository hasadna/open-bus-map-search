import { Layout } from 'antd'
import Logo from './Logo'
import MenuList from './MenuList'

//style
import './Navbar.scss'

const { Sider } = Layout
const Navbar = () => {
  return (
    <Layout dir="rtl">
      <Sider className="sidebar">
        <Logo />
        <MenuList />
      </Sider>
    </Layout>
  )
}

export default Navbar
