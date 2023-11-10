import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cn from 'classnames'
import './menu.scss'
import { useTranslation } from 'react-i18next'
import {
  BarChartOutlined, BellOutlined, BugOutlined, DollarOutlined,
  FieldTimeOutlined,
  HeatMapOutlined,
  LaptopOutlined,
  LineChartOutlined, RadarChartOutlined
} from "@ant-design/icons";
import DashboardPage from "src/pages/dashboard/DashboardPage";
import TimelinePage from "src/pages/TimelinePage";
import GapsPage from "src/pages/GapsPage";
import GapsPatternsPage from "src/pages/gapsPatterns";
import RealtimeMapPage from "src/pages/RealtimeMapPage";
import SingleLineMapPage from "src/pages/SingleLineMapPage";
import About from "src/pages/About";


const Menu = () => {
  const { t, i18n } = useTranslation()

  const PAGES = [
    {
      label: t('dashboard_page_title'),
      path: '/dashboard',
      icon: LaptopOutlined,
      element: <DashboardPage />,
    },
    {
      label: t('timeline_page_title'),
      path: '/timeline',
      searchParamsRequired: true,
      icon: FieldTimeOutlined,
      element: <TimelinePage />,
    },
    {
      label: t('gaps_page_title'),
      path: '/gaps',
      searchParamsRequired: true,
      icon: BarChartOutlined,
      element: <GapsPage />,
    },
    {
      label: t('gaps_patterns_page_title'),
      path: '/gaps_patterns',
      icon: LineChartOutlined,
      element: <GapsPatternsPage />,
    },
    {
      label: t('realtime_map_page_title'),
      path: '/map',
      icon: HeatMapOutlined,
      element: <RealtimeMapPage />,
    },
    {
      label: t('singleline_map_page_title'),
      path: '/single-line-map',
      searchParamsRequired: true,
      icon: RadarChartOutlined,
      element: <SingleLineMapPage />,
    },
    {
      label: t('about_title'),
      path: '/about',
      icon: BellOutlined,
      element: <About />,
    },
    {
      label: t('report_a_bug_title'),
      path: 'https://github.com/hasadna/open-bus-map-search/issues',
      icon: BugOutlined,
      element: null,
    },
    {
      label: t('donate_title'),
      path: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
      icon: DollarOutlined,
      element: null,
    },
  ]

  const [currentLanguage, setCurrentLanguage] = useState('en')

  const navigate = useNavigate()
  const { pathname: currpage } = useLocation()

  const handleChangeLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'he' : 'en'
    setCurrentLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
  }

  return (
    <ul className="menu">
      {PAGES.map((page) => (
        <li
          className={cn('menu-item', { active: currpage === page.path })}
          key={page.path}
          onClick={() =>
            page.path[0] === '/' ? navigate(page.path) : window.open(page.path, '_blank')
          }>
          {React.createElement(page.icon)}
          {
            <span
              style={{
                width: '15px',
              }}
            />
          }
          {t(page.label)}
        </li>
      ))}
      {null && <button onClick={handleChangeLanguage}>Change Language</button>}
    </ul>
  )
}

export default Menu
