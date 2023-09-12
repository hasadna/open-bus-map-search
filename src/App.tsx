import React, { useCallback, useEffect } from 'react'
import 'antd/dist/antd.min.css'
import './App.scss'
import TimelinePage from 'src/pages/TimelinePage'
import { ConfigProvider, Layout } from 'antd'
import 'leaflet/dist/leaflet.css'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
import heIL from 'antd/es/locale/he_IL'
import { BrowserRouter as Router, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import GapsPage from './pages/GapsPage'
import { PageSearchState, SearchContext } from './model/pageState'
import moment from 'moment'
import DashboardPage from './pages/dashboard/DashboardPage'
import { useSessionStorage } from 'usehooks-ts'
import Header from './pages/components/header/Header'
import RealtimeMapPage from './pages/RealtimeMapPage'
import SingleLineMapPage from './pages/SingleLineMapPage'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { ThemeProvider, createTheme } from '@mui/material'

const { Content } = Layout

const StyledLayout = styled(Layout)`
  height: 100vh;
`
const StyledContent = styled(Content)`
  margin: 24px 16px 0;
  overflow: auto;
`

const StyledBody = styled.div`
  padding: 24px;
  min-height: 360px;
`

const PAGES = [
  {
    label: TEXTS.dashboard_page_title,
    key: '/dashboard',
  },
  {
    label: TEXTS.timeline_page_title,
    key: '/timeline',
  },
  {
    label: TEXTS.gaps_page_title,
    key: '/gaps',
  },
  {
    label: TEXTS.realtime_map_page_title,
    key: '/map',
  },
  {
    label: TEXTS.singleline_map_page_title,
    key: '/single-line-map',
  },
]

const theme = createTheme({
  palette: {
    primary: {
      main: '#5f5bff',
    },
  },
})

const App = () => {
  const location = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()
  const operatorId = searchParams.get('operatorId')
  const lineNumber = searchParams.get('lineNumber')
  const routeKey = searchParams.get('routeKey')
  const timestamp = searchParams.get('timestamp')

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
  }, [location])

  const [search, setSearch] = useSessionStorage<PageSearchState>('search', {
    timestamp: +timestamp! || moment().valueOf(),
    operatorId: operatorId || '',
    lineNumber: lineNumber || '',
    routeKey: routeKey || '',
  })

  useEffect(() => {
    setSearchParams({
      operatorId: search.operatorId!,
      lineNumber: search.lineNumber!,
      routeKey: search.routeKey!,
      timestamp: search.timestamp.toString(),
    })
  }, [search.lineNumber, search.operatorId, search.routeKey, search.timestamp, location.pathname])

  const safeSetSearch = useCallback((mutate: (prevState: PageSearchState) => PageSearchState) => {
    setSearch((current: PageSearchState) => {
      const newSearch = mutate(current)
      return newSearch
    })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <SearchContext.Provider value={{ search, setSearch: safeSetSearch }}>
          <ConfigProvider direction="rtl" locale={heIL}>
            <StyledLayout className="main">
              <Header pages={PAGES} />
              <Layout>
                <StyledContent>
                  <StyledBody>
                    <Routes>
                      <Route path={PAGES[0].key} element={<DashboardPage />} />
                      <Route path={PAGES[1].key} element={<TimelinePage />} />
                      <Route path={PAGES[2].key} element={<GapsPage />} />
                      <Route path={PAGES[3].key} element={<RealtimeMapPage />} />
                      <Route path={PAGES[4].key} element={<SingleLineMapPage />} />
                      <Route path="*" element={<Navigate to={PAGES[0].key} replace />} />
                    </Routes>
                  </StyledBody>
                </StyledContent>
              </Layout>
            </StyledLayout>
          </ConfigProvider>
        </SearchContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

const RoutedApp = () => (
  <Router>
    <App />
  </Router>
)
export default RoutedApp
