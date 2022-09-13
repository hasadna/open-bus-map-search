import React from 'react'
import './App.css'
import LinePage from './pages/line-page/LinePage'
import { ConfigProvider, Empty, Layout, Typography } from 'antd'
import 'leaflet/dist/leaflet.css'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
const { Header, Content } = Layout

const StyledContent = styled(Content)`
  margin: 24px 16px 0;
`

const StyledBody = styled.div`
  padding: 24px;
  min-height: 360px;
`

function App() {
  return (
    <ConfigProvider direction="rtl" renderEmpty={() => <Empty description={TEXTS.no_results} />}>
      <Layout>
        <Header>
          <Typography.Title level={3} style={{ color: 'white' }}>
            {TEXTS.title}
          </Typography.Title>
        </Header>
        <Layout>
          <StyledContent>
            <StyledBody>
              <LinePage />
            </StyledBody>
          </StyledContent>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
