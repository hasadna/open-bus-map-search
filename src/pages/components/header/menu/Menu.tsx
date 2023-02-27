import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cn from 'classnames'
import './menu.scss'

export type MenuPage = {
  label: string
  key: string
}

function Menu({ pages }: { pages: MenuPage[] }) {
  const navigate = useNavigate()
  const { pathname: currpage } = useLocation()
  console.log({ currpage, active: pages.map((p) => p.key === currpage) })

  return (
    <ul className="menu">
      {pages.map((page) => (
        <li
          className={cn('menu-item', { active: currpage === page.key })}
          key={page.key}
          onClick={() => navigate(page.key)}>
          {page.label}
        </li>
      ))}
    </ul>
  )
}

export default Menu
