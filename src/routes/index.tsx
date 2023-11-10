import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'

import DashboardPage from '../pages/dashboard/DashboardPage'
import TimelinePage from '../pages/TimelinePage'
import GapsPage from '../pages/GapsPage'
import GapsPatternsPage from '../pages/gapsPatterns'
import RealtimeMapPage from '../pages/RealtimeMapPage'
import SingleLineMapPage from '../pages/SingleLineMapPage'
import About from '../pages/About'

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

const RoutesList = () => {

  const { t } = useTranslation()

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

  const RedirectToDashboard = () => <Navigate to={PAGES[0].path} replace />
  const routes = PAGES.filter((r) => r.element)
  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      <Route path="*" element={<RedirectToDashboard />} />
    </Routes>
  )
}

export default RoutesList
