import React, { useState } from 'react'
import 'antd/dist/antd.css'
import './App.scss'
import TimelinePage from 'src/pages/TimelinePage'
import { ConfigProvider, Layout } from 'antd'
import 'leaflet/dist/leaflet.css'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
import heIL from 'antd/es/locale/he_IL'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import GapsPage from './pages/GapsPage'
import { PageSearchState, SearchContext } from './model/pageState'
import moment from 'moment'
import DashboardPage from './pages/dashboard/DashboardPage'
import Header from './pages/components/header/Header'

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
]

const App = () => {
  const [search, setSearch] = useState<PageSearchState>({ timestamp: moment() })
  return (
    <SearchContext.Provider value={{ search, setSearch }}>
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
