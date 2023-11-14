// SideBar.js

import Menu from './menu/Menu'
import './sidebar.scss'
import { Drawer } from 'antd'
import { useContext } from 'react'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
import GitHubLink from './GitHubLink/GitHubLink'

const Logo = () => (
  <div style={{ overflow: 'hidden' }}>
    <h1 className={'sidebar-logo'}>דאטאבוס</h1>
  </div>
)

export default function SideBar() {
  const { drawerOpen, setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)

  return (
    <>
      <Drawer
        placement="right"
        mask
        width={280}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="hideOnDesktop">
        <Menu />
      </Drawer>
      <aside className={'sidebar hideOnMobile'}>
        <Logo />
        <div className="sidebar-divider"></div>
        <Menu />
        <div className="sidebar-divider"></div>
        <GitHubLink/>
      </aside>
    </>
  )
}
