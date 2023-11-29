import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './menu.scss'
import { useTranslation } from 'react-i18next'
import { PAGES as pages } from 'src/routes'

import type { MenuProps } from 'antd'
import { Menu } from 'antd'

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
  const { t, i18n } = useTranslation()
  const items: MenuItem[] = pages.map((itm) => {
    return getItem(<Link to={t(itm.path)}>{t(itm.label)}</Link>, itm.path, itm.icon)
  })
  const [currentLanguage, setCurrentLanguage] = useState('en')

  const handleChangeLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'he' : 'en'
    setCurrentLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
  }
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
    <>
      <Menu
        onClick={handleClick}
        theme="light"
        selectedKeys={[current]}
        mode="inline"
        items={items}
      />
      {null && <button onClick={handleChangeLanguage}>Change Language</button>}
    </>
  )
}

export default MainMenu
