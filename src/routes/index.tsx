import { TEXT_KEYS } from 'src/resources/texts'
import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react';
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const TimelinePage = lazy(() => import('../pages/TimelinePage'));
const GapsPage = lazy(() => import('../pages/GapsPage'));
const GapsPatternsPage = lazy(() => import('../pages/gapsPatterns'));
const RealtimeMapPage = lazy(() => import('../pages/RealtimeMapPage'));
const SingleLineMapPage = lazy(() => import('../pages/SingleLineMapPage'));
const About = lazy(() => import('../pages/About'));
import CircularProgress from '@mui/material/CircularProgress';

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

export const PAGES: MenuPage[] = [
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
    <Suspense fallback={<CircularProgress />}>
      <Routes>
        {PAGES.map((page) => (
          <Route key={page.key} path={page.key} element={getPageElement(page)} />
        ))}
        <Route path="*" element={<RedirectToDashboard />} />
      </Routes>
    </Suspense>
  );

}
const getPageElement = (page: MenuPage) => {
  switch (page.key) {
    case '/dashboard':
      return <DashboardPage />;
    case '/timeline':
      return <TimelinePage />;
    case '/gaps':
      return <GapsPage />;
    case '/gaps_patterns':
      return <GapsPatternsPage />;
    case '/map':
      return <RealtimeMapPage />;
    case '/single-line-map':
      return <SingleLineMapPage />;
    case '/about':
      return <About />;
    default:
      return null;
  }
}
export default RoutesList
