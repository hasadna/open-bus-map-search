import { MenuOutlined } from '@ant-design/icons'
import IconButton from '@mui/material/IconButton'
import { Layout } from 'antd'
import { Suspense, useContext } from 'react'
import { Link, Outlet } from 'react-router'
import styled from 'styled-components'
import { EasterEgg } from 'src/pages/components/EasterEgg/EasterEgg'
import { Envelope } from 'src/pages/components/EasterEgg/Envelope'
import Preloader from 'src/shared/Preloader'
import AppFooter from './AppFooter'
import LayoutContext, { LayoutContextInterface, LayoutCtx } from './LayoutContext'
import SideBar from './sidebar/SideBar'

const { Content } = Layout

const StyledLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
`
const StyledContent = styled(Content)`
  margin: 24px 16px 0;
  overflow: auto;
`
const StyledBody = styled.div`
  padding: 0 24px;
  min-height: 360px;
`

const MobileMenuButton = () => {
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  return (
    <IconButton
      className="hideOnDesktop"
      onClick={() => setDrawerOpen(true)}
      sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1000 }}
      size="small">
      <MenuOutlined />
    </IconButton>
  )
}

export function MainLayout() {
  return (
    <StyledLayout className="main">
      <LayoutContext>
        <MobileMenuButton />
        <SideBar />
        <Layout>
          <StyledContent id="main-content">
            <StyledBody>
              <Suspense fallback={<Preloader />}>
                <Outlet />
                <EasterEgg code="storybook">
                  <a href="/storybook/index.html">
                    <Envelope />
                  </a>
                </EasterEgg>
                <EasterEgg code="geek">
                  <Link to="/data-research">
                    <Envelope />
                  </Link>
                </EasterEgg>
                <EasterEgg code="dashboard">
                  <Link to="/dashboard">
                    <Envelope />
                  </Link>
                </EasterEgg>
              </Suspense>
            </StyledBody>
          </StyledContent>
          <AppFooter />
        </Layout>
      </LayoutContext>
    </StyledLayout>
  )
}
