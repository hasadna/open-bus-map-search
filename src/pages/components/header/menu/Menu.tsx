import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cn from 'classnames'
import './menu.scss'

import { useEffect, useState } from 'react'

export type MenuPage = {
  label: string
  key: string
}

function Menu({ pages, shouldDismiss }: { pages: MenuPage[]; shouldDismiss: () => void }) {
  const navigate = useNavigate()
  const { pathname: currpage } = useLocation()
  const isMobile= window.innerWidth <= 768

  console.log({ currpage, active: pages.map((p) => p.key === currpage) })

  function navigateTo(page: MenuPage, dismiss: boolean) {
    page.key[0] === '/' ? navigate(page.key) : window.open(page.key, '_blank')
    if (dismiss) {
      shouldDismiss()
    }
  }

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <ul className="menu">
      {pages.map((page) => (
        <li
          className={cn('menu-item', { active: currpage === page.key })}
          key={page.key}
          onClick={() => navigateTo(page, isMobile)}>
          {page.label}
        </li>
      ))}
    </ul>
  )
}

export default Menu
