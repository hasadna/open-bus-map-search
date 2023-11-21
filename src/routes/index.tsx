import { TEXT_KEYS } from 'src/resources/texts'
import { Navigate, Route, Routes } from 'react-router-dom'

import React, { lazy, Suspense } from 'react'
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const TimelinePage = lazy(() => import('../pages/TimelinePage'))
const GapsPage = lazy(() => import('../pages/GapsPage'))
const GapsPatternsPage = lazy(() => import('../pages/gapsPatterns'))
const RealtimeMapPage = lazy(() => import('../pages/RealtimeMapPage'))
const SingleLineMapPage = lazy(() => import('../pages/SingleLineMapPage'))
const About = lazy(() => import('../pages/About'))
const Profile = lazy(() => import('../pages/Profile'))
import CircularProgress from '@mui/material/CircularProgress'

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

export const PAGES = [
  {
    label: TEXT_KEYS.dashboard_page_title,
    path: '/dashboard',
    icon: <LaptopOutlined />,
    element: <DashboardPage />,
  },
  {
    label: TEXT_KEYS.timeline_page_title,
    path: '/timeline',
    searchParamsRequired: true,
    icon: <FieldTimeOutlined />,
    element: <TimelinePage />,
  },
  {
    label: TEXT_KEYS.gaps_page_title,
    path: '/gaps',
    searchParamsRequired: true,
    icon: <BarChartOutlined />,
    element: <GapsPage />,
  },
  {
    label: TEXT_KEYS.gaps_patterns_page_title,
    path: '/gaps_patterns',
    icon: <LineChartOutlined />,
    element: <GapsPatternsPage />,
  },
  {
    label: TEXT_KEYS.realtime_map_page_title,
    path: '/map',
    icon: <HeatMapOutlined />,
    element: <RealtimeMapPage />,
  },
  {
    label: TEXT_KEYS.singleline_map_page_title,
    path: '/single-line-map',
    searchParamsRequired: true,
    icon: <RadarChartOutlined />,
    element: <SingleLineMapPage />,
  },
  {
    label: TEXT_KEYS.about_title,
    path: '/about',
    icon: <BellOutlined />,
    element: <About />,
  },
  {
    label: TEXT_KEYS.report_a_bug_title,
    path: 'https://github.com/hasadna/open-bus-map-search/issues',
    icon: <BugOutlined />,
    element: null,
  },
  {
    label: TEXT_KEYS.donate_title,
    path: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
    icon: <DollarOutlined />,
    element: null,
  },
]

const RoutesList = () => {
  const RedirectToDashboard = () => <Navigate to={PAGES[0].path} replace />
  const routes = PAGES.filter((r) => r.element)
  return (
    <Suspense fallback={<CircularProgress />}>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<RedirectToDashboard />} />
      </Routes>
    </Suspense>
  )
}

export default RoutesList
