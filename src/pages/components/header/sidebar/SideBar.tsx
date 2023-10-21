import React, { useState } from 'react'
import Menu, { MenuPage } from '../menu/Menu'
import cn from 'classnames'
import './sidebar.scss'

export default function SideBar({ pages }: { pages: MenuPage[] }) {
  const [open, setOpen] = useState(false)

  return (
    <aside className={cn('sidebar', { open })}>
      <div className="sidebar-menu-toggle" onClick={() => setOpen(!open)}>
        <div className="sidebar-menu-toggle-line" />
        <div className="sidebar-menu-toggle-line" />
        <div className="sidebar-menu-toggle-line" />
      </div>
      <h1>דאטאבוס</h1>
      <Menu pages={pages} />
    </aside>
  )
}
