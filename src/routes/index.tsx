import {
  BarChartOutlined,
  BugOutlined,
  CalendarOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  GithubOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LaptopOutlined,
  LineChartOutlined,
  RadarChartOutlined,
} from '@ant-design/icons'
import { DirectionsBusOutlined, MapOutlined, Psychology, RouteOutlined } from '@mui/icons-material'
import { lazy } from 'react'
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router'
import { getRouteById } from 'src/api/gtfsService'
import { ErrorPage } from 'src/pages/ErrorPage'
import VelocityHeatmapPage from 'src/pages/velocityHeatmap'
// Eager-imported to merge their recharts/CJS modules into the main chunk and
// avoid a rolldown OXC-minifier codegen bug that produces `var X=X()` self-calls
// in the lazy chunks (vite:preloadError -> reload loop). See rolldown-vite #595.
import DashboardPage from 'src/pages/dashboard/DashboardPage'
import GapsPatternsPage from 'src/pages/gapsPatterns'
import { DataResearch } from 'src/pages/DataResearch/DataResearch'
import { MainRoute } from './MainRoute'

const HomePage = lazy(() => import('../pages/homepage/HomePage'))
const TimelinePage = lazy(() => import('../pages/historicTimeline'))
const GapsPage = lazy(() => import('../pages/gaps'))
const TimeBasedMapPage = lazy(() => import('../pages/timeBasedMap'))
const SingleLineMapPage = lazy(() => import('../pages/singleLineMap'))
const About = lazy(() => import('../pages/about'))
const Operator = lazy(() => import('../pages/operator'))
const Profile = lazy(() => import('../pages/lineProfile/LineProfile'))
const BugReportForm = lazy(() => import('../pages/bugReport/BugReportForm'))
const PublicAppeal = lazy(() => import('../pages/publicAppeal'))
const Hackathon = lazy(() => import('../pages/hackathon/Hackathon'))

export const PAGES = [
  {
    label: 'homepage_title',
    path: '/',
    icon: <HomeOutlined />,
    element: <HomePage />,
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
    icon: <MapOutlined />,
    element: <TimeBasedMapPage />,
  },
  {
    label: 'velocity_heatmap_page_title',
    path: '/velocity-heatmap',
    searchParamsRequired: true,
    icon: <RadarChartOutlined />,
    element: <VelocityHeatmapPage />,
  },
  {
    label: 'singleline_map_page_title',
    path: '/single-line-map',
    searchParamsRequired: true,
    icon: <RouteOutlined />,
    element: <SingleLineMapPage />,
  },
  {
    label: 'operator_title',
    path: '/operator',
    searchParamsRequired: true,
    icon: <DirectionsBusOutlined />,
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
  {
    label: 'hackathon_title',
    path: '/hackathon',
    icon: <CalendarOutlined />,
    element: <Hackathon />,
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
    label: 'dashboard_page_title',
    path: '/dashboard',
    icon: <LaptopOutlined />,
    element: <DashboardPage />,
  },
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
    <Route path="/:lang?">
      <Route element={<MainRoute />}>
        {routesList.map(({ path, element }) => (
          <Route
            key={path}
            path={path === '/' ? undefined : path.replace(/^\//, '')}
            index={path === '/'}
            element={element}
            ErrorBoundary={ErrorPage}
          />
        ))}
        <Route
          path="profile/:gtfsRideGtfsRouteId"
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
    </Route>
  )
}

window.addEventListener('vite:preloadError', () => {
  window.location.reload() // in case new version is released, we will need to refresh the page. see https://vitejs.dev/guide/build#load-error-handling
})

const routes = createRoutesFromElements(getRoutesList())

// If the URL doesn't have a language prefix, we will use the saved language or default to Hebrew
const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_BASE_PATH || '/',
})

export default router
