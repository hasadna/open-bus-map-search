import React, { useState } from 'react'
import Menu, { MenuPage } from './menu/Menu'
import cn from 'classnames'

export default function Header({ pages }: { pages: MenuPage[] }) {
  const [open, setOpen] = useState(false)

  function dismiss() {
    setOpen(false)
  }
  return (
    <header className={cn('header', { open })}>
      <div className="header-menu" onClick={() => setOpen(!open)}>
        <div className="header-menu-line" />
        <div className="header-menu-line" />
        <div className="header-menu-line" />
      </div>
      <h1>דאטאבוס</h1>
      <Menu pages={pages} shouldDismiss={dismiss} />
    </header>
  )
}
