import { Layout } from 'antd'
import styled from 'styled-components'
import { Link, Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import MainHeader from './header/Header'
import SideBar from './sidebar/SideBar'
import LayoutContext from './LayoutContext'
import Preloader from 'src/shared/Preloader'
import { EasterEgg } from 'src/pages/EasterEgg/EasterEgg'
import { Envelope } from 'src/pages/EasterEgg/Envelope'

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

export function MainLayout() {
  return (
    <StyledLayout className="main">
      <LayoutContext>
        <SideBar />
        <Layout>
          <MainHeader />
          <StyledContent>
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
              </Suspense>
            </StyledBody>
          </StyledContent>
        </Layout>
      </LayoutContext>
    </StyledLayout>
  )
}
