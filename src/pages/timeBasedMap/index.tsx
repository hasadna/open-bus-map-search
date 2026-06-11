import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
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

// Hardcoded default so the API/CDN cache is warm for first-time visitors.
// The page owns its datetime independently from the global `date` field
// because it needs sub-day precision and should not reset when the user
// navigates away and back (unlike global date which is a shared day picker).
// Stored as a readable Israel-local "YYYY-MM-DDTHH:mm" (17:00 IST == 15:00 UTC;
// Israel is pre-DST on Pi Day, so the offset is +02 not +03).
const PI_DAY = '2026-03-14T17:00'

const DEFAULT_CENTER: [number, number] = [32.3057988, 34.85478613]
const DEFAULT_ZOOM = 8

export default function TimeBasedMapPage() {
  const { t } = useTranslation()

  // The page's datetime is page-specific and shareable — the recipient of a
  // share link sees the same moment. Map viewport/expansion are left to
  // MapShell's own state.
  const { params, setParams } = usePageState(
    'time-map',
    {
      params: { datetime: PI_DAY },
      ui: { scrollPosition: 0 },
    },
    ['datetime'],
  )

  const from = useMemo(() => dayjs.tz(params.datetime, ISRAEL_TIMEZONE), [params.datetime])
  const to = useMemo(() => from.add(1, 'minutes'), [from])
  const { locations, isLoading } = useVehicleLocations({ from, to })
  const positions = useMemo(() => locations.map(toPoint), [locations])

  const handleFromChange = useCallback(
    (timestamp: dayjs.Dayjs | null) => {
      setParams((prev) => ({
        ...prev,
        datetime: (timestamp ?? dayjs.tz(PI_DAY, ISRAEL_TIMEZONE)).format('YYYY-MM-DDTHH:mm'),
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
      <MapShell center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom={true}>
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

  // Fly to user's location on first load for a personalised default view.
  // Geolocation is best-effort; failure is silently ignored.
  useMemo(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      map.flyTo([position.coords.latitude, position.coords.longitude], 13)
    })
  }, [])

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
