import { TEXT_KEYS } from 'src/resources/texts'
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

import { MenuPage } from '../pages/components/header/menu/Menu'

export const PAGES = [
  {
    label: TEXT_KEYS.dashboard_page_title,
    key: '/dashboard',
    icon: LaptopOutlined,
  },
  {
    label: TEXT_KEYS.timeline_page_title,
    key: '/timeline',
    searchParamsRequired: true,
    icon: FieldTimeOutlined,
  },
  {
    label: TEXT_KEYS.gaps_page_title,
    key: '/gaps',
    searchParamsRequired: true,
    icon: BarChartOutlined,
  },
  {
    label: TEXT_KEYS.gaps_patterns_page_title,
    key: '/gaps_patterns',
    icon: LineChartOutlined,
  },
  {
    label: TEXT_KEYS.realtime_map_page_title,
    key: '/map',
    icon: HeatMapOutlined,
  },
  {
    label: TEXT_KEYS.singleline_map_page_title,
    key: '/single-line-map',
    searchParamsRequired: true,
    icon: RadarChartOutlined,
  },
  {
    label: TEXT_KEYS.about_title,
    key: '/about',
    icon: BellOutlined,
  },
  {
    label: TEXT_KEYS.report_a_bug_title,
    key: 'https://github.com/hasadna/open-bus-map-search/issues',
    icon: BugOutlined,
  },
  {
    label: TEXT_KEYS.donate_title,
    key: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
    icon: DollarOutlined,
  },
] as MenuPage[]

const RoutesList = () => {
  const RedirectToDashboard = () => <Navigate to={PAGES[0].key} replace />

  return (
    <Routes>
      <Route path={PAGES[0].key} element={<DashboardPage />} />
      <Route path={PAGES[1].key} element={<TimelinePage />} />
      <Route path={PAGES[2].key} element={<GapsPage />} />
      <Route path={PAGES[3].key} element={<GapsPatternsPage />} />
      <Route path={PAGES[4].key} element={<RealtimeMapPage />} />
      <Route path={PAGES[5].key} element={<SingleLineMapPage />} />
      <Route path={PAGES[6].key} element={<About />} />
      <Route path="*" element={<RedirectToDashboard />} />
    </Routes>
  )
}

export default RoutesList
