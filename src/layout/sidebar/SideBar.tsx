import Menu from './menu/Menu'
import './sidebar.scss'
import { Drawer, Layout } from 'antd'
import { useContext, useState } from 'react'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import GitHubLink from './GitHubLink/GitHubLink'
import { Link } from 'react-router-dom'
import { usePages } from 'src/routes'
const { Sider } = Layout

const Logo = () => (
  <div style={{ overflow: 'hidden' }}>
    <h1 className={'sidebar-logo'}>דאטאבוס</h1>
  </div>
)
const CollapsedLogo = () => <h1 className={'sidebar-logo-collapsed'}>🚌</h1>

export default function SideBar() {
  const { drawerOpen, setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [collapsed, setCollapsed] = useState(false)
  const pages = usePages()
  return (
    <>
      <Drawer
        placement="right"
        mask
        width={280}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="hideOnDesktop"
        bodyStyle={{ padding: '0' }}>
        <Logo />
        <div className="sidebar-divider"></div>
        <Menu />
        <div className="sidebar-divider"></div>
        <GitHubLink />
      </Drawer>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth={60}
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean) => setCollapsed(value)}
        className="hideOnMobile">
        <Link to={pages[0].path} replace>
          {collapsed ? <CollapsedLogo /> : <Logo />}
        </Link>
        <div className="sidebar-divider"></div>
        <Menu />
        <div className="sidebar-divider"></div>
        <GitHubLink />
      </Sider>
    </>
  )
}
