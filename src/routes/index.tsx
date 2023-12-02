import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const TimelinePage = lazy(() => import('../pages/TimelinePage'))
const GapsPage = lazy(() => import('../pages/GapsPage'))
const GapsPatternsPage = lazy(() => import('../pages/gapsPatterns'))
const RealtimeMapPage = lazy(() => import('../pages/RealtimeMapPage'))
const SingleLineMapPage = lazy(() => import('../pages/SingleLineMapPage'))
const About = lazy(() => import('../pages/About'))
const Profile = lazy(() => import('../pages/Profile'))
const BugReportForm = lazy(() => import('../pages/BugReportForm '))
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

export const usePages = () => {
  const { t } = useTranslation()
  return [
    {
      label: t('dashboard_page_title'),
      path: '/dashboard',
      icon: <LaptopOutlined />,
      element: <DashboardPage />,
    },
    {
      label: t('timeline_page_title'),
      path: '/timeline',
      searchParamsRequired: true,
      icon: <FieldTimeOutlined />,
      element: <TimelinePage />,
    },
    {
      label: t('gaps_page_title'),
      path: '/gaps',
      searchParamsRequired: true,
      icon: <BarChartOutlined />,
      element: <GapsPage />,
    },
    {
      label: t('gaps_patterns_page_title'),
      path: '/gaps_patterns',
      icon: <LineChartOutlined />,
      element: <GapsPatternsPage />,
    },
    {
      label: t('realtime_map_page_title'),
      path: '/map',
      icon: <HeatMapOutlined />,
      element: <RealtimeMapPage />,
    },
    {
      label: t('singleline_map_page_title'),
      path: '/single-line-map',
      searchParamsRequired: true,
      icon: <RadarChartOutlined />,
      element: <SingleLineMapPage />,
    },
    {
      label: t('about_title'),
      path: '/about',
      icon: <BellOutlined />,
      element: <About />,
    },
    {
      label: t('report_a_bug_title'),
      path: 'report-a-bug',
      icon: <BugOutlined />,
      element: <BugReportForm />,
    },
    {
      label: t('donate_title'),
      path: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
      icon: <DollarOutlined />,
      element: null,
    },
  ]
}

const RoutesList = () => {
  const pages = usePages()
  const RedirectToDashboard = () => <Navigate to={pages[0].path} replace />
  const routes = pages.filter((r) => r.element)
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
