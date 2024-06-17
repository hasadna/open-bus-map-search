import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './menu.scss'
import { useTranslation } from 'react-i18next'

import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { PAGES } from 'src/routes'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
type MenuItem = Required<MenuProps>['items'][number]
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem
}

const MainMenu = () => {
  const { t } = useTranslation()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const items: MenuItem[] = PAGES.map((itm) => {
    return getItem(
      <Link to={itm.path} onClick={() => setDrawerOpen(false)}>
        {t(itm.label)}
      </Link>,
      itm.path,
      itm.icon,
    )
  })

  const location = useLocation()
  const [current, setCurrent] = useState(
    location.pathname === '/' || location.pathname === '' ? '/dashboard' : location.pathname,
  )

  useEffect(() => {
    if (location) {
      if (current !== location.pathname) {
        setCurrent(location.pathname)
      }
    }
  }, [location, current])

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    setCurrent(key)
  }
  return (
    <Menu
      onClick={handleClick}
      theme="light"
      selectedKeys={[current]}
      mode="inline"
      items={items}
    />
  )
}

export default MainMenu
