import {
  BiotechTwoTone,
  DirectionsBusTwoTone,
  EmojiTransportationTwoTone,
  EventTwoTone,
  GitHub,
  HistoryTwoTone,
  HomeTwoTone,
  InfoTwoTone,
  MapTwoTone,
  MonitorTwoTone,
  NoTransferTwoTone,
  PaidTwoTone,
  PestControlTwoTone,
  PsychologyTwoTone,
  QueryStatsTwoTone,
  RadarTwoTone,
  RouteTwoTone,
} from '@mui/icons-material'
import { lazy } from 'react'
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router'
import { getRouteById } from 'src/api/gtfsService'
// Eager-imported [DashboardPage, GapsPatternsPage, DataResearch] to merge their recharts/CJS modules into the main chunk and
// avoid a rolldown OXC-minifier codegen bug that produces `var X=X()` self-calls
// in the lazy chunks (vite:preloadError -> reload loop). See rolldown-vite #595.
import DashboardPage from 'src/pages/dashboard/DashboardPage'
import { DataResearch } from 'src/pages/DataResearch/DataResearch'
import { ErrorPage } from 'src/pages/ErrorPage'
import GapsPatternsPage from 'src/pages/gapsPatterns'
import VelocityHeatmapPage from 'src/pages/velocityHeatmap'
import { MainRoute } from './MainRoute'

const HomePage = lazy(() => import('../pages/homepage/HomePage'))
const TimelinePage = lazy(() => import('../pages/historicTimeline'))
const GapsPage = lazy(() => import('../pages/gaps'))
const TimeBasedMapPage = lazy(() => import('../pages/timeBasedMap'))
const SingleLineMapPage = lazy(() => import('../pages/singleLineMap'))
const VehiclePage = lazy(() => import('../pages/vehicle'))
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
    icon: <HomeTwoTone />,
    element: <HomePage />,
  },
  {
    label: 'timeline_page_title',
    path: '/timeline',
    searchParamsRequired: true,
    icon: <HistoryTwoTone />,
    element: <TimelinePage />,
  },
  {
    label: 'gaps_page_title',
    path: '/gaps',
    searchParamsRequired: true,
    icon: <NoTransferTwoTone />,
    element: <GapsPage />,
  },
  {
    label: 'gaps_patterns_page_title',
    path: '/gaps_patterns',
    icon: <QueryStatsTwoTone />,
    element: <GapsPatternsPage />,
  },
  {
    label: 'time_based_map_page_title',
    path: '/map',
    icon: <MapTwoTone />,
    element: <TimeBasedMapPage />,
  },
  {
    label: 'velocity_heatmap_page_title',
    path: '/velocity-heatmap',
    searchParamsRequired: true,
    icon: <RadarTwoTone />,
    element: <VelocityHeatmapPage />,
  },
  {
    label: 'singleline_map_page_title',
    path: '/single-line-map',
    searchParamsRequired: true,
    icon: <RouteTwoTone />,
    element: <SingleLineMapPage />,
  },
  {
    label: 'vehicle_page_title',
    path: '/vehicle',
    searchParamsRequired: true,
    icon: <DirectionsBusTwoTone />,
    element: <VehiclePage />,
  },
  {
    label: 'operator_title',
    path: '/operator',
    searchParamsRequired: true,
    icon: <EmojiTransportationTwoTone />,
    element: <Operator />,
  },
  {
    label: 'about_title',
    path: '/about',
    icon: <InfoTwoTone />,
    element: <About />,
  },
  {
    label: 'donate_title',
    path: '/donate',
    icon: <PaidTwoTone />,
    element: null, //DonateModal
  },
  {
    label: 'public_appeal_title',
    path: '/public-appeal',
    icon: <PsychologyTwoTone />,
    element: <PublicAppeal />,
  },
  {
    label: 'hackathon_title',
    path: '/hackathon',
    icon: <EventTwoTone />,
    element: <Hackathon />,
  },
] as const

export const HEADER_LINKS = [
  {
    label: 'report_a_bug_title',
    path: '/report-a-bug',
    icon: <PestControlTwoTone fontSize="inherit" />,
    element: <BugReportForm />,
  },
  {
    label: 'github_link',
    path: 'https://github.com/hasadna/open-bus-map-search',
    icon: <GitHub fontSize="inherit" />,
    element: null,
  },
] as const

const HIDDEN_PAGES = [
  {
    label: 'dashboard_page_title',
    path: '/dashboard',
    icon: <MonitorTwoTone />,
    element: <DashboardPage />,
  },
  {
    label: 'data-research',
    path: '/data-research',
    icon: <BiotechTwoTone />,
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
