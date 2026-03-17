import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
import DonateModal from 'src/pages/DonateModal/DonateModal'
import { PAGES } from 'src/routes'
import './menu.scss'

type MenuItem = Required<MenuProps>['items'][number]
type MainMenuProps = {
  collapsed?: boolean
}

const MENU_GROUPS = [
  {
    key: 'menu_group_analysis',
    paths: ['/single-line-map', '/timeline', '/gaps', '/gaps_patterns', '/operator'],
  },
  {
    key: 'menu_group_maps',
    paths: ['/map', '/velocity-heatmap'],
  },
  {
    key: 'menu_group_community',
    paths: ['/public-appeal', '/about', '/donate'],
  },
] as const

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

function getGroup(label: React.ReactNode, key: React.Key, children: MenuItem[]): MenuItem {
  return {
    key,
    type: 'group',
    label,
    children,
  } as MenuItem
}

const MainMenu = ({ collapsed = false }: MainMenuProps) => {
  const { t } = useTranslation()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [isDonateModalVisible, setDonateModalVisible] = useState(false)

  const handleDonateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setDonateModalVisible(true)
    setDrawerOpen(false)
  }

  const routeItems = PAGES.reduce<Record<string, MenuItem>>((acc, itm) => {
    acc[itm.path] =
      itm.label === 'donate_title'
        ? getItem(
            <a href="#" onClick={handleDonateClick}>
              {t(itm.label)}
            </a>,
            itm.path,
            itm.icon,
          )
        : getItem(
            <Link to={itm.path} onClick={() => setDrawerOpen(false)}>
              {t(itm.label)}
            </Link>,
            itm.path,
            itm.icon,
          )
    return acc
  }, {})

  const groupedItems: MenuItem[] = [
    routeItems['/'],
    ...MENU_GROUPS.map(({ key, paths }) =>
      getGroup(
        <span className="sidebar-menu-group-title">{t(key)}</span>,
        key,
        paths.map((path) => routeItems[path]).filter(Boolean),
      ),
    ),
  ].filter(Boolean)

  const flatItems: MenuItem[] = [
    routeItems['/'],
    ...MENU_GROUPS.flatMap(({ paths }) => paths.map((path) => routeItems[path]).filter(Boolean)),
  ].filter(Boolean)

  const items = collapsed ? flatItems : groupedItems

  const location = useLocation()
  const [current, setCurrent] = useState(location.pathname || '/')

  useEffect(() => {
    const nextPath = location.pathname || '/'

    if (current !== nextPath) {
      setCurrent(nextPath)
    }
  }, [location.pathname, current])

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    setCurrent(key)
  }
  return (
    <>
      <Menu
        className="sidebar-menu"
        onClick={handleClick}
        theme="light"
        selectedKeys={[current]}
        mode="inline"
        inlineCollapsed={collapsed}
        items={items}
      />
      <DonateModal isVisible={isDonateModalVisible} onClose={() => setDonateModalVisible(false)} />
    </>
  )
}

export default MainMenu
