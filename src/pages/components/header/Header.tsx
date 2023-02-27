import React from 'react'
import Menu, { MenuPage } from './menu/Menu'

export default function Header({ pages }: { pages: MenuPage[] }) {
  return (
    <header className="header">
      <h1>לוח זמנים היסטורי</h1>
      <Menu pages={pages} />
    </header>
  )
}
