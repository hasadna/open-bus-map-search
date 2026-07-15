import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import dayjs, { ISRAEL_TIMEZONE, parseIsraelLocalDatetime } from 'src/dayjs'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { usePageState } from 'src/hooks/usePageState'
import useVehicleLocations from 'src/hooks/useVehicleLocations'
import { type Point, toPoint } from 'src/pages/components/map-related/map-types'
import { BusToolTip } from 'src/pages/components/map-related/MapLayers/BusToolTip'
import { MapShell } from 'src/pages/components/map-related/MapShell'
import { DateSelector } from '../components/DateSelector'
import { PageContainer } from '../components/PageContainer'
import { TimeSelector } from '../components/TimeSelector'
import { busIcon, busIconPath } from '../components/utils/BusIcon'
import createClusterCustomIcon from '../components/utils/customCluster/customCluster'
import InfoYoutubeModal from '../components/YoutubeModal'

const DEFAULT_TIME = dayjs('2023-03-14T15:00:00Z')
// Israel-local minute string, e.g. 2023-03-14T17:00 — the shareable form of DEFAULT_TIME.
const DEFAULT_DATETIME = DEFAULT_TIME.tz(ISRAEL_TIMEZONE).format('YYYY-MM-DDTHH:mm')
const DEFAULT_POSITION: Point = {
  loc: [32.3057988, 34.85478613],
  color: 0,
}

export default function TimeBasedMapPage() {
  // datetime is page-local and shareable: an Israel-local minute string that
  // round-trips through the share URL (namespaced as `time-based-map.datetime`).
  const { params, setParams } = usePageState('time-based-map', {
    params: { datetime: DEFAULT_DATETIME },
    ui: { scrollPosition: 0 },
  })
  const from = useMemo(
    () => parseIsraelLocalDatetime(params.datetime) ?? DEFAULT_TIME,
    [params.datetime],
  )
  const to = useMemo(() => dayjs(from).add(1, 'minutes'), [from])
  const { locations, isLoading } = useVehicleLocations({ from, to })
  const { t } = useTranslation()
  const positions = useMemo(() => locations.map(toPoint), [locations])
  const handleFromChange = useCallback(
    (time: dayjs.Dayjs | null) => {
      const next = time ?? DEFAULT_TIME
      setParams((prev) => ({
        ...prev,
        datetime: next.tz(ISRAEL_TIMEZONE).format('YYYY-MM-DDTHH:mm'),
      }))
    },
    [setParams],
  )

  return (
    <PageContainer className="map-container">
      <Typography variant="h4" className="page-title">
        {t('time_based_map_page_title')}
        <InfoYoutubeModal
          label={t('open_video_about_this_page')}
          title={t('youtube_modal_info_title')}
          videoUrl="https://www.youtube-nocookie.com/embed/bXg50_j_hTA?si=t8PiTrTA1budRZg-&amp;start=150"
        />
      </Typography>
      <Grid>
        <Alert severity="info" variant="outlined" icon={false}>
          {t('time_based_map_page_description')}
        </Alert>
      </Grid>
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
