import React, { useState } from 'react'
import Menu, { MenuPage } from './menu/Menu'
import cn from 'classnames'

export default function SideBar({ pages }: { pages: MenuPage[] }) {
  const [open, setOpen] = useState(false)

  return (
    <aside className={cn('sidebar', { open })}>
      <div className="sideber-menu" onClick={() => setOpen(!open)}>
        <div className="sideber-menu-line" />
        <div className="sideber-menu-line" />
        <div className="sideber-menu-line" />
      </div>
      <h1>דאטאבוס</h1>
      <Menu pages={pages} />
    </aside>
  )
}
