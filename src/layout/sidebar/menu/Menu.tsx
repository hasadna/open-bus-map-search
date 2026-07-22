import { EventTwoTone } from '@mui/icons-material'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
import { useTheme } from 'src/layout/ThemeContext'
import { getPathWithoutLang } from 'src/locale/allTranslations'
import DonateModal from 'src/pages/DonateModal/DonateModal'
import { EVENT_DATE_ISO, REGISTRATION_CLOSE_ISO } from 'src/pages/hackathon/challenges'
import { PAGES } from 'src/routes'
import './menu.scss'

type MenuItem = Required<MenuProps>['items'][number]
type MainMenuProps = {
  collapsed?: boolean
}

const MENU_GROUPS = [
  {
    key: 'menu_group_analysis',
    paths: [
      '/single-line-map',
      '/timeline',
      '/gaps',
      '/gaps_patterns',
      '/operator',
      '/vehicle',
      '/train',
    ],
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
  }
}

function getGroup(label: React.ReactNode, key: React.Key, children: MenuItem[]): MenuItem {
  return {
    key,
    type: 'group',
    label,
    children,
  }
}

const HACKATHON_REG_CLOSE_MS = new Date(REGISTRATION_CLOSE_ISO).getTime()
const HACKATHON_EVENT_MS = new Date(EVENT_DATE_ISO).getTime()
const HACKATHON_MENU_HIDE_MS = HACKATHON_EVENT_MS + 3 * 24 * 60 * 60 * 1000 // hide 3 days after event

const MainMenu = ({ collapsed = false }: MainMenuProps) => {
  const { t } = useTranslation()
  const { currentLanguage } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [isDonateModalVisible, setDonateModalVisible] = useState(false)

  const now = Date.now()
  const showHackathon = now < HACKATHON_MENU_HIDE_MS

  const hackathonDaysLeft =
    now < HACKATHON_REG_CLOSE_MS
      ? Math.ceil((HACKATHON_REG_CLOSE_MS - now) / (1000 * 60 * 60 * 24))
      : null

  const hackathonItem = showHackathon
    ? getItem(
        <Link to={`/${currentLanguage}/hackathon`} onClick={() => setDrawerOpen(false)}>
          {t('hackathon_title')}
          {hackathonDaysLeft !== null && (
            <span className="hackathon-badge">
              {t('hackathon_days_left_badge', { days: hackathonDaysLeft })}
            </span>
          )}
        </Link>,
        '/hackathon',
        <EventTwoTone />,
      )
    : null

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
            <Link to={`/${currentLanguage}${itm.path}`} onClick={() => setDrawerOpen(false)}>
              {t(itm.label)}
            </Link>,
            itm.path,
            itm.icon,
          )
    return acc
  }, {})

  const groupedItems: MenuItem[] = [
    routeItems['/'],
    hackathonItem,
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
    hackathonItem,
    ...MENU_GROUPS.flatMap(({ paths }) => paths.map((path) => routeItems[path]).filter(Boolean)),
  ].filter(Boolean)

  const items = collapsed ? flatItems : groupedItems

  const { pathname } = useLocation()
  const [current, setCurrent] = useState(getPathWithoutLang(pathname) || '/')

  useEffect(() => {
    const nextPath = getPathWithoutLang(pathname) || '/'

    if (current !== nextPath) {
      setCurrent(nextPath)
    }
  }, [pathname, current])

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
