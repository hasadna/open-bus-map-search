import React, { useState } from 'react'
import './App.css'
import TimelinePage from 'src/pages/TimelinePage'
import { ConfigProvider, Layout, Menu } from 'antd'
import 'leaflet/dist/leaflet.css'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
import heIL from 'antd/es/locale/he_IL'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import GapsPage from './pages/GapsPage'
import { PageSearchState, SearchContext } from './model/pageState'
import moment from 'moment'
import DashboardPage from './pages/DashboardPage'

const { Header, Content } = Layout

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

const StyledMenu = styled(Menu)`
  height: 100%;
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
]

const App = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [search, setSearch] = useState<PageSearchState>({ timestamp: moment() })
  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <ConfigProvider direction="rtl" locale={heIL}>
        <StyledLayout>
          <Header>
            <StyledMenu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={[pathname]}
              items={PAGES}
              onClick={({ key }) => navigate(key)}
            />
          </Header>
          <Layout>
            <StyledContent>
              <StyledBody>
                <Routes>
                  <Route path={PAGES[0].key} element={<DashboardPage />} />
                  <Route path={PAGES[1].key} element={<TimelinePage />} />
                  <Route path={PAGES[2].key} element={<GapsPage />} />
                  <Route path="*" element={<Navigate to={PAGES[0].key} replace />} />
                </Routes>
              </StyledBody>
            </StyledContent>
          </Layout>
        </StyledLayout>
      </ConfigProvider>
    </SearchContext.Provider>
  )
}

const RoutedApp = () => (
  <Router>
    <App />
  </Router>
)
export default RoutedApp
