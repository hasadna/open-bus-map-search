import React, { useState } from 'react'
import Menu, { MenuPage } from '../menu/Menu'
import cn from 'classnames'
import './sidebar.scss'
import { MenuOutlined } from '@ant-design/icons'

const SidebarToggle = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => (
  <div className="sidebar-menu-toggle" onClick={() => setOpen(!open)}>
    <MenuOutlined />
  </div>
)

const Logo = () => <h1 className={'sidebar-logo'}>דאטאבוס</h1>

export default function SideBar({ pages }: { pages: MenuPage[] }) {
  const [open, setOpen] = useState(false)
  return (
    <aside className={cn('sidebar', { open })}>
      <Logo />
      <SidebarToggle open={open} setOpen={setOpen} />
      <Menu pages={pages} />
    </aside>
  )
}
