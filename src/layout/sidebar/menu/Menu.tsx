import React, { useEffect, useReducer, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './menu.scss'
import { useTranslation } from 'react-i18next'
import { PAGES as pages } from 'src/routes'

import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { Button } from '@mui/material'
import { EasterEgg } from 'src/pages/EasterEgg/EasterEgg'

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

const LanguageToggle = () => {
  const { t, i18n } = useTranslation()
  const [, handleChangeLanguage] = useReducer((state: string) => {
    const newLanguage = { he: 'en', en: 'he' }[state]
    i18n.changeLanguage(newLanguage)
    return newLanguage!
  }, 'he')

  return (
    <EasterEgg code="english">
      <Button
        onClick={handleChangeLanguage}
        variant="contained"
        style={{ margin: 'auto', display: 'block' }}>
        {t('Change Language')}
      </Button>
    </EasterEgg>
  )
}

const MainMenu = () => {
  const { t } = useTranslation()
  const items: MenuItem[] = pages.map((itm) => {
    return getItem(<Link to={t(itm.path)}>{t(itm.label)}</Link>, itm.path, itm.icon)
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
    <>
      <Menu
        onClick={handleClick}
        theme="light"
        selectedKeys={[current]}
        mode="inline"
        items={items}
      />
      {<LanguageToggle />}
    </>
  )
}

export default MainMenu
