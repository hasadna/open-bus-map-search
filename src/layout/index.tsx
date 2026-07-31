import { styled } from '@mui/material/styles'
import { Layout } from 'antd'
import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'
import { EasterEgg } from 'src/pages/components/EasterEgg/EasterEgg'
import { Envelope } from 'src/pages/components/EasterEgg/Envelope'
import Preloader from 'src/shared/Preloader'
import { AppFooter } from './AppFooter'
import MainHeader from './header/Header'
import LayoutContext from './LayoutContext'
import SideBar from './sidebar/SideBar'

const { Content } = Layout

const StyledLayout = styled(Layout)({
  height: '100vh',
  overflow: 'hidden',
})
const StyledContent = styled(Content)({
  margin: '24px 16px 0',
  overflow: 'auto',
})
const StyledBody = styled('div')({
  padding: '0 24px',
  minHeight: 360,
  // Keep natural height so tall content scrolls the container instead of being
  // squished by the flex layout.
  flexShrink: 0,
})

export function MainLayout() {
  return (
    <StyledLayout className="main">
      <LayoutContext>
        <SideBar />
        <Layout>
          <MainHeader />
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
            <AppFooter />
          </StyledContent>
        </Layout>
      </LayoutContext>
    </StyledLayout>
  )
}
