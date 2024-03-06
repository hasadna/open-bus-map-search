import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { lazy } from 'react'

const HomePage = lazy(() => import('../pages/homepage/HomePage'))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const TimelinePage = lazy(() => import('../pages/historicTimeline'))
const GapsPage = lazy(() => import('../pages/gaps'))
const GapsPatternsPage = lazy(() => import('../pages/gapsPatterns'))
const RealtimeMapPage = lazy(() => import('../pages/realtimeMap'))
const SingleLineMapPage = lazy(() => import('../pages/singleLineMap'))
const About = lazy(() => import('../pages/about'))
const Profile = lazy(() => import('../pages/Profile'))
const BugReportForm = lazy(() => import('../pages/BugReportForm '))
const DataResearch = lazy(() =>
  import('../pages/DataResearch/DataResearch').then((m) => ({
    default: m.DataResearch,
  })),
)

import {
  HomeOutlined,
  RadarChartOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  HeatMapOutlined,
  LaptopOutlined,
  FieldTimeOutlined,
  BugOutlined,
  BarChartOutlined,
  LineChartOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { MainRoute } from './MainRoute'
import { ErrorPage } from 'src/pages/ErrorPage'

export const PAGES = [
  {
    label: 'dashboard_page_title',
    path: '/dashboard',
    icon: <LaptopOutlined />,
    element: <DashboardPage />,
  },
  {
    label: 'timeline_page_title',
    path: '/timeline',
    searchParamsRequired: true,
    icon: <FieldTimeOutlined />,
    element: <TimelinePage />,
  },
  {
    label: 'gaps_page_title',
    path: '/gaps',
    searchParamsRequired: true,
    icon: <BarChartOutlined />,
    element: <GapsPage />,
  },
  {
    label: 'gaps_patterns_page_title',
    path: '/gaps_patterns',
    icon: <LineChartOutlined />,
    element: <GapsPatternsPage />,
  },
  {
    label: 'realtime_map_page_title',
    path: '/map',
    icon: <HeatMapOutlined />,
    element: <RealtimeMapPage />,
  },
  {
    label: 'singleline_map_page_title',
    path: '/single-line-map',
    searchParamsRequired: true,
    icon: <RadarChartOutlined />,
    element: <SingleLineMapPage />,
  },
  {
    label: 'about_title',
    path: '/about',
    icon: <InfoCircleOutlined />,
    element: <About />,
  },
] as const

export const HEADER_LINKS = [
  {
    label: 'report_a_bug_title',
    path: 'report-a-bug',
    icon: <BugOutlined />,
    element: <BugReportForm />,
  },
  {
    label: 'donate_title',
    path: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
    icon: <DollarOutlined />,
    element: null,
  },
  {
    label: 'github_link',
    path: 'https://github.com/hasadna/open-bus-map-search',
    icon: <GithubOutlined />,
    element: null,
  },
] as const

const HIDDEN_PAGES = [
  {
    label: 'home_page',
    path: '/home',
    icon: <HomeOutlined />,
    element: <HomePage />, //need to build - created only the file and routing
  },
  {
    label: 'data-research',
    path: '/data-research',
    icon: <InfoCircleOutlined />,
    element: <DataResearch />,
  },
] as const

const getRoutesList = () => {
  const pages = [...PAGES, ...HIDDEN_PAGES, ...HEADER_LINKS]
  const RedirectToDashboard = () => <Navigate to={pages[0].path} replace />
  const routes = pages.filter((r) => r.element)
  return (
    <Route element={<MainRoute />}>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} ErrorBoundary={ErrorPage} />
      ))}
      <Route
        path="/profile/:gtfsRideGtfsRouteId"
        key={'/profile/:gtfsRideGtfsRouteId'}
        element={<Profile />}
        ErrorBoundary={ErrorPage}
        loader={async ({ params: { gtfsRideGtfsRouteId } }) => {
          const resp = await fetch(
            `https://open-bus-stride-api.hasadna.org.il/gtfs_routes/get?id=${gtfsRideGtfsRouteId}`,
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const gtfs_route = await resp.json()
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return gtfs_route
        }}
      />
      <Route path="*" element={<RedirectToDashboard />} key="back" />
    </Route>
    // </Suspense>
  )
}

const routes = createRoutesFromElements(getRoutesList())

const router = createBrowserRouter(routes)

export default router
