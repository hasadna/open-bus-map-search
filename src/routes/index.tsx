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
const SecretPage = lazy(() => import('../pages/secretPage/SecretPage'))
import ProtectedRoute from './ProtectedRoute'
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
  VerifiedOutlined
} from '@ant-design/icons'

export const usePages = () => {
  const { t } = useTranslation()
  return [
    {
      label: t('secret_page_title'),
      path: '/secretpage',
      icon: <VerifiedOutlined />,
      element: <SecretPage />,
      isProtected: true,
    },
    {
      label: t('dashboard_page_title'),
      path: '/dashboard',
      icon: <LaptopOutlined />,
      element: <DashboardPage />,
      isProtected: false,
    },
    {
      label: t('timeline_page_title'),
      path: '/timeline',
      searchParamsRequired: true,
      icon: <FieldTimeOutlined />,
      element: <TimelinePage />,
      isProtected: false,
    },
    {
      label: t('gaps_page_title'),
      path: '/gaps',
      searchParamsRequired: true,
      icon: <BarChartOutlined />,
      element: <GapsPage />,
      isProtected: false,
    },
    {
      label: t('gaps_patterns_page_title'),
      path: '/gaps_patterns',
      icon: <LineChartOutlined />,
      element: <GapsPatternsPage />,
      isProtected: false,
    },
    {
      label: t('realtime_map_page_title'),
      path: '/map',
      icon: <HeatMapOutlined />,
      element: <RealtimeMapPage />,
      isProtected: false,
    },
    {
      label: t('singleline_map_page_title'),
      path: '/single-line-map',
      searchParamsRequired: true,
      icon: <RadarChartOutlined />,
      element: <SingleLineMapPage />,
      isProtected: false,
    },
    {
      label: t('about_title'),
      path: '/about',
      icon: <BellOutlined />,
      element: <About />,
      isProtected: false,
    },
    {
      label: t('report_a_bug_title'),
      path: 'report-a-bug',
      icon: <BugOutlined />,
      element: <BugReportForm />,
      isProtected: false,
    },
    {
      label: t('donate_title'),
      path: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
      icon: <DollarOutlined />,
      element: null,
      isProtected: false,
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
        {routes.map(({ path, element, isProtected}) => (
          <Route key={path} path={path} element=
        {
          isProtected ? 
          <ProtectedRoute>
          element
          </ProtectedRoute> 
          : 
          element
        } />
        ))}
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<RedirectToDashboard />} />
      </Routes>
    </Suspense>
  )
}

export default RoutesList
