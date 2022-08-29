import React from 'react'
import './App.css'
import LinePage from './pages/line-page/LinePage'
import { Layout, Typography } from 'antd'
import 'leaflet/dist/leaflet.css'

const { Header, Content } = Layout

function App() {
  return (
    <div className="App">
      <Layout>
        <Header>
          <Typography.Title level={3} style={{ color: 'white' }}>
            Shamebus
          </Typography.Title>
        </Header>
        <Layout>
          <Content style={{ margin: '24px 16px 0' }}>
            <div style={{ padding: 24, minHeight: 360 }}>
              <LinePage />
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  )
}

export default App
