import { CircularProgress, Tooltip } from '@mui/material'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SearchContext } from '../../model/pageState'
import { DateSelector } from '../components/DateSelector'
import { PageContainer } from '../components/PageContainer'
import InfoYoutubeModal from '../components/YoutubeModal'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { getRoutesAsync } from 'src/api/gtfsService'
import { useSingleVehicleData } from 'src/hooks/useSingleVehicleData'
import VehicleNumberSelector from 'src/pages/components/VehicleSelector'
import { INPUT_SIZE } from 'src/resources/sizes'
import dayjs from 'src/pages/components/utils/dayjs'
import '../Map.scss'

const SingleVehicleMap = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, timestamp, vehicleNumber } = search
  const { t } = useTranslation()

  useEffect(() => {
    // console.log('vehicleNumber:', vehicleNumber)
    const controller = new AbortController()
    const signal = controller.signal

    if (!operatorId || operatorId === '0' || !vehicleNumber) {
      setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
      return
    }

    getRoutesAsync(
      dayjs(timestamp),
      dayjs(timestamp),
      operatorId,
      vehicleNumber?.toString(),
      signal,
    )
      .then((routes) =>
        setSearch((current) =>
          search.vehicleNumber === vehicleNumber ? { ...current, routes: routes } : current,
        ),
      )
      .catch((err) => {
        console.error(err)
        setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
        controller.abort()
      })
    return () => controller.abort()
  }, [operatorId, vehicleNumber, timestamp])

  const { positions, filteredPositions, locationsAreLoading } = useSingleVehicleData(vehicleNumber)
  // console.log('positions:', positions)
  // console.log('filteredPositions:', filteredPositions)

  return (
    <PageContainer className="map-container">
      <Typography className="page-title" variant="h4">
        {t('singlevehicle_map_page_title')}
        <InfoYoutubeModal
          label={t('open_video_about_this_page')}
          title={t('singlevehicle_map_page_description')}
          videoUrl="https://www.youtube-nocookie.com/embed/bXg50_j_hTA?si=inyvqDylStvgNRA6&amp;start=93"
        />
      </Typography>

      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        <Grid size={{ sm: 4, xs: 12 }}>
          <DateSelector
            time={dayjs(timestamp)}
            onChange={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts?.valueOf() ?? Date.now() }))
            }
          />
        </Grid>

        {positions && (
          <>
            <Grid size={{ sm: 4, xs: 12 }}>
              <VehicleNumberSelector
                vehicleNumber={vehicleNumber}
                setVehicleNumber={(number) =>
                  setSearch((current) => ({ ...current, vehicleNumber: number }))
                }
              />
            </Grid>
            <Grid size={{ sm: 2, xs: 12 }}>
              {locationsAreLoading && (
                <Tooltip title={t('loading_times_tooltip_content')}>
                  <CircularProgress />
                </Tooltip>
              )}
            </Grid>
          </>
        )}
      </Grid>

      <MapWithLocationsAndPath positions={filteredPositions} showNavigationButtons={false} />
    </PageContainer>
  )
}

export default SingleVehicleMap
