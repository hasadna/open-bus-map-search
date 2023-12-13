import { Layout } from 'antd'
import MainHeader from './header/Header'
import SideBar from './sidebar/SideBar'
import styled from 'styled-components'
import LayoutContext from './LayoutContext'
import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import Preloader from 'src/shared/Preloader'

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
              </Suspense>
            </StyledBody>
          </StyledContent>
        </Layout>
      </LayoutContext>
    </StyledLayout>
  )
}
