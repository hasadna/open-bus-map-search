import {
  BarChartOutlined,
  BugOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  GithubOutlined,
  HeatMapOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LaptopOutlined,
  LineChartOutlined,
  RadarChartOutlined,
} from '@ant-design/icons'
import { AirportShuttle, Psychology } from '@mui/icons-material'
import { lazy } from 'react'
import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router'
import { MainRoute } from './MainRoute'
import { getRouteById } from 'src/api/gtfsService'
import { ErrorPage } from 'src/pages/ErrorPage'

const HomePage = lazy(() => import('../pages/homepage/HomePage'))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const TimelinePage = lazy(() => import('../pages/historicTimeline'))
const GapsPage = lazy(() => import('../pages/gaps'))
const GapsPatternsPage = lazy(() => import('../pages/gapsPatterns'))
const TimeBasedMapPage = lazy(() => import('../pages/timeBasedMap'))
const SingleLineMapPage = lazy(() => import('../pages/singleLineMap'))
const SingleVehicleMapPage = lazy(() => import('../pages/singleVehicleMap'))
const About = lazy(() => import('../pages/about'))
const Operator = lazy(() => import('../pages/operator'))
const Profile = lazy(() => import('../pages/lineProfile/LineProfile'))
const BugReportForm = lazy(() => import('../pages/BugReportForm '))
const DataResearch = lazy(() =>
  import('../pages/DataResearch/DataResearch').then((m) => ({
    default: m.DataResearch,
  })),
)
const PublicAppeal = lazy(() => import('../pages/publicAppeal'))

export const PAGES = [
  {
    label: 'homepage_title',
    path: '/',
    icon: <HomeOutlined />,
    element: <HomePage />,
  },
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
    label: 'time_based_map_page_title',
    path: '/map',
    icon: <HeatMapOutlined />,
    element: <TimeBasedMapPage />,
  },
  {
    label: 'singleline_map_page_title',
    path: '/single-line-map',
    searchParamsRequired: true,
    icon: <RadarChartOutlined />,
    element: <SingleLineMapPage />,
  },
  {
    label: 'singlevehicle_map_page_title',
    path: '/single-vehicle-map',
    searchParamsRequired: true,
    icon: <RadarChartOutlined />,
    element: <SingleVehicleMapPage />,
  },
  {
    label: 'operator_title',
    path: '/operator',
    searchParamsRequired: true,
    icon: <AirportShuttle />,
    element: <Operator />,
  },
  {
    label: 'about_title',
    path: '/about',
    icon: <InfoCircleOutlined />,
    element: <About />,
  },
  {
    label: 'donate_title',
    path: '/donate',
    icon: <DollarOutlined />,
    element: null, //DonateModal
  },
  {
    label: 'public_appeal_title',
    path: '/public-appeal',
    icon: <Psychology />,
    element: <PublicAppeal />,
  },
] as const

export const HEADER_LINKS = [
  {
    label: 'report_a_bug_title',
    path: '/report-a-bug',
    icon: <BugOutlined />,
    element: <BugReportForm />,
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
    label: 'data-research',
    path: '/data-research',
    icon: <InfoCircleOutlined />,
    element: <DataResearch />,
  },
] as const

const routesList = [...PAGES, ...HIDDEN_PAGES, ...HEADER_LINKS].filter((r) => r.element)
const RedirectToHomepage = <Navigate to={routesList[0].path} replace />

export const getRoutesList = () => {
  return (
    <Route element={<MainRoute />}>
      {routesList.map(({ path, element }) => (
        <Route key={path} path={path} element={element} ErrorBoundary={ErrorPage} />
      ))}
      <Route
        path="/profile/:gtfsRideGtfsRouteId"
        element={<Profile />}
        ErrorBoundary={ErrorPage}
        loader={async ({ params }) => {
          try {
            const route = await getRouteById(params?.gtfsRideGtfsRouteId)
            return { route }
          } catch (error) {
            return {
              route: null,
              message: (error as Error).message,
            }
          }
        }}
      />
      <Route path="*" element={RedirectToHomepage} key="back" />
    </Route>
  )
}

window.addEventListener('vite:preloadError', () => {
  window.location.reload() // in case new version is released, we will need to refresh the page. see https://vitejs.dev/guide/build#load-error-handling
})

const routes = createRoutesFromElements(getRoutesList())

const router = createBrowserRouter(routes)

export default router
