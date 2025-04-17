import './sidebar.scss'
import { Drawer, Layout } from 'antd'
import { useContext, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import Menu from './menu/Menu'
import { Logo } from './logo'
import { PAGES } from 'src/routes'
const { Sider } = Layout

const CollapsedLogo = () => <h1 className={'sidebar-logo-collapsed'}>🚌</h1>

export default function SideBar() {
  const { drawerOpen, setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [collapsed, setCollapsed] = useState(false)
  const { i18n } = useTranslation()

  return (
    <>
      <Drawer
        placement={i18n.dir() === 'rtl' ? 'right' : 'left'}
        mask
        width={280}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="hideOnDesktop"
        styles={{ body: { padding: '0' } }}>
        <Logo />
        <div className="sidebar-divider"></div>
        <Menu />
        <div className="sidebar-divider"></div>
      </Drawer>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth={60}
        width={250}
        collapsible
        collapsed={collapsed}
        style={{ overflowY: 'auto', marginBottom: '48px' }}
        onCollapse={(value: boolean) => setCollapsed(value)}
        className="hideOnMobile">
        <Link to={PAGES[0].path} replace>
          {collapsed ? <CollapsedLogo /> : <Logo />}
        </Link>
        <div className="sidebar-divider"></div>
        <Menu />
        <div className="sidebar-divider"></div>
      </Sider>
    </>
  )
}
