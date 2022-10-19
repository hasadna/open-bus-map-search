import React from 'react'
import './App.css'
import LinePage from 'src/pages/LinePage'
import { ConfigProvider, Layout, Typography } from 'antd'
import 'leaflet/dist/leaflet.css'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
const { Header, Content } = Layout
import heIL from 'antd/es/locale/he_IL'

const StyledContent = styled(Content)`
  margin: 24px 16px 0;
  overflow: auto;
`

const StyledBody = styled.div`
  padding: 24px;
  min-height: 360px;
`

function App() {
  return (
    <ConfigProvider direction="rtl" locale={heIL}>
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
