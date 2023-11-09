import { TEXT_KEYS } from 'src/resources/texts'
import { Navigate, Route, Routes } from 'react-router-dom'
import React, { Suspense, lazy } from 'react'

import SingleLineMapPage from '../pages/SingleLineMapPage'

import {
  RadarChartOutlined,
  BellOutlined,
  DollarOutlined,
  HeatMapOutlined,
  LaptopOutlined,
  FieldTimeOutlined,
  BugOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { Spin } from 'antd'

export const PAGES = [
  {
    label: TEXT_KEYS.dashboard_page_title,
    path: '/dashboard',
    icon: LaptopOutlined,
    element: '../pages/dashboard/DashboardPage',
  },
  {
    label: TEXT_KEYS.timeline_page_title,
    path: '/timeline',
    searchParamsRequired: true,
    icon: FieldTimeOutlined,
    element: '../pages/TimelinePage',
  },
  {
    label: TEXT_KEYS.gaps_page_title,
    path: '/gaps',
    searchParamsRequired: true,
    icon: BarChartOutlined,
    element: '../pages/GapsPage',
  },
  {
    label: TEXT_KEYS.gaps_patterns_page_title,
    path: '/gaps_patterns',
    icon: LineChartOutlined,
    element: '../pages/gapsPatterns',
  },
  {
    label: TEXT_KEYS.realtime_map_page_title,
    path: '/map',
    icon: HeatMapOutlined,
    element: '../pages/RealtimeMapPage',
  },
  {
    label: TEXT_KEYS.singleline_map_page_title,
    path: '/single-line-map',
    searchParamsRequired: true,
    icon: RadarChartOutlined,
    element: SingleLineMapPage, // instead of '../pages/SingleLineMapPage',
  },
  {
    label: TEXT_KEYS.about_title,
    path: '/about',
    icon: BellOutlined,
    element: '../pages/About',
  },
  {
    label: TEXT_KEYS.report_a_bug_title,
    path: 'https://github.com/hasadna/open-bus-map-search/issues',
    icon: BugOutlined,
    element: null,
  },
  {
    label: TEXT_KEYS.donate_title,
    path: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
    icon: DollarOutlined,
    element: null,
  },
]

const RoutesList = () => {
  const RedirectToDashboard = () => <Navigate to={PAGES[0].path} replace />
  const routes = PAGES.filter((r) => r.element)
  return (
    <Routes>
      {routes.map(({ path, element }) => {
        const Element =
          typeof element === 'string'
            ? lazy(() => import(element as string))
            : (element as React.FC)
        return (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<Spin size="small" />}>
                <Element />
              </Suspense>
            }
          />
        )
      })}
      <Route path="*" element={<RedirectToDashboard />} />
    </Routes>
  )
}

export default RoutesList
