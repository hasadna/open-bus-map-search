import styled from 'styled-components'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import { useTranslation } from 'react-i18next'
import Widget from 'src/shared/Widget'
import { useLoaderData } from 'react-router-dom'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import LineProfileHeader from './LineProfileHeader'
import { LineProfileDetails } from './LineProfileDetails'
import { Route } from './Route.interface'

const LineProfileWrapper = () => (
  <PageContainer className="line-data-container">
    <LineProfile />
  </PageContainer>
)

const LineProfile = () => {
  const { t } = useTranslation()
  const route = useLoaderData() as Route & { message?: string }

  if (route.message)
    return (
      <NotFound>
        <Widget>
          <h1>{t('lineProfile.notFound')}</h1>
          <pre>{route.message}</pre>
        </Widget>
      </NotFound>
    )

  return (
    <Grid xs={12} lg={6}>
      <Widget>
        <LineProfileHeader {...route} />
        <LineProfileDetails {...route} />
      </Widget>
      <LineProfileMapContainer>
        <MapWithLocationsAndPath positions={[]} plannedRouteStops={[]} />
      </LineProfileMapContainer>
    </Grid>
  )
}

const LineProfileMapContainer = styled.div`
  .map-info {
    height: 15rem;
  }
`

export default LineProfileWrapper
