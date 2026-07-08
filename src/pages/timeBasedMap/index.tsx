import { CircularProgress, Grid } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import dayjs, { ISRAEL_TIMEZONE, parseIsraelLocalDatetime } from 'src/dayjs'
import { useAgencyList } from 'src/hooks/useAgencyList'
import useVehicleLocations from 'src/hooks/useVehicleLocations'
import { InitialUrlParamsContext, PageShareParamsContext } from 'src/model/routeContext'
import { type Point, toPoint } from 'src/pages/components/map-related/map-types'
import { BusToolTip } from 'src/pages/components/map-related/MapLayers/BusToolTip'
import { MapShell } from 'src/pages/components/map-related/MapShell'
import { DateSelector } from '../components/DateSelector'
import { PageContainer } from '../components/PageContainer'
import {
  PageHeader,
  PageHeaderSubtitle,
  PageHeaderTitle,
  PageHeaderVideoTrigger,
} from '../components/pageHeader'
import { TimeSelector } from '../components/TimeSelector'
import { busIcon, busIconPath } from '../components/utils/BusIcon'
import createClusterCustomIcon from '../components/utils/customCluster/customCluster'

const DEFAULT_TIME = dayjs('2023-03-14T15:00:00Z')
const DEFAULT_POSITION: Point = {
  loc: [32.3057988, 34.85478613],
  color: 0,
}

export default function TimeBasedMapPage() {
  const initialUrlParams = useContext(InitialUrlParamsContext)
  const [from, setFrom] = useState(
    () =>
      (initialUrlParams.datetime && parseIsraelLocalDatetime(initialUrlParams.datetime)) ||
      DEFAULT_TIME,
  )
  const to = useMemo(() => dayjs(from).add(1, 'minutes'), [from])
  const { locations, isLoading } = useVehicleLocations({ from, to })
  const { t } = useTranslation()
  const positions = useMemo(() => locations.map(toPoint), [locations])
  const handleFromChange = useCallback((time: dayjs.Dayjs | null) => {
    setFrom(time ?? DEFAULT_TIME)
  }, [])

  // LEGACY: manual share-param injection — replace with usePageState's per-page
  // persistent `params` when this page is migrated.
  const { setParams } = useContext(PageShareParamsContext)
  useEffect(() => {
    // Shared as a readable Israel-local datetime, e.g. 2023-03-14T17:00
    setParams({ datetime: from.tz(ISRAEL_TIMEZONE).format('YYYY-MM-DDTHH:mm') })
    return () => setParams({})
  }, [from, setParams])

  return (
    <PageContainer className="map-container">
      <PageHeader>
        <PageHeaderTitle>{t('time_based_map_page_title')}</PageHeaderTitle>
        <PageHeaderSubtitle>
          {t('time_based_map_page_description')}{' '}
          <Trans
            i18nKey="page_header_video_guide_inline"
            components={{
              video: (
                <PageHeaderVideoTrigger
                  title={t('youtube_modal_info_title')}
                  videoUrl="https://www.youtube-nocookie.com/embed/bXg50_j_hTA?si=t8PiTrTA1budRZg-&start=150">
                  {null}
                </PageHeaderVideoTrigger>
              ),
            }}
          />
        </PageHeaderSubtitle>
      </PageHeader>
      <Grid container spacing={2}>
        {/* from date */}
        <Grid size={{ md: 4, sm: 6, xs: 12 }}>
          <DateSelector time={from} onChange={handleFromChange} />
        </Grid>
        <Grid size={{ md: 4, sm: 6, xs: 12 }}>
          <TimeSelector time={from} onChange={handleFromChange} />
        </Grid>
        {/* loaded info */}
        <Grid size={{ xs: 11 }} container sx={{ alignItems: 'center' }}>
          <p>{`${locations.length} - ${t('show_x_bus_locations')}`}</p>
          {isLoading && <CircularProgress size="20px" />}
        </Grid>
      </Grid>
      <MapShell center={DEFAULT_POSITION.loc} zoom={8} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        <Markers positions={positions} />
      </MapShell>
    </PageContainer>
  )
}

function Markers({ positions }: { positions: Point[] }) {
  const map = useMap()
  const agencyList = useAgencyList()
  const operatorNames = useMemo(
    () =>
      agencyList.reduce<Record<number, string>>((names, agency) => {
        if (agency.operatorRef && agency.agencyName) {
          names[agency.operatorRef] = agency.agencyName
        }
        return names
      }, {}),
    [agencyList],
  )

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      map.flyTo([position.coords.latitude, position.coords.longitude], 13)
    })
  }, [map])

  const markerNodes = useMemo(
    () =>
      positions.map((pos, index) => {
        const operatorId = pos.operator?.toString() || 'default'
        const icon = busIcon({
          operator_id: operatorId,
          name: pos.operator ? operatorNames[pos.operator] : undefined,
        })

        return (
          <Marker position={pos.loc} icon={icon} key={pos.point?.id ?? `${operatorId}-${index}`}>
            <Popup minWidth={300} maxWidth={700}>
              <BusToolTip position={pos} icon={busIconPath(operatorId)} />
            </Popup>
          </Marker>
        )
      }),
    [operatorNames, positions],
  )

  return (
    <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
      {markerNodes}
    </MarkerClusterGroup>
  )
}
