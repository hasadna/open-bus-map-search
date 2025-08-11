import { OpenInFullRounded } from '@mui/icons-material'
import { Alert, CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Map } from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { DateSelector } from '../components/DateSelector'
import { Label } from '../components/Label'
import MinuteSelector from '../components/MinuteSelector'
import { PageContainer } from '../components/PageContainer'
import { TimeSelector } from '../components/TimeSelector'
import { busIcon, busIconPath } from '../components/utils/BusIcon'
import createClusterCustomIcon from '../components/utils/customCluster/customCluster'
import InfoYoutubeModal from '../components/YoutubeModal'
import { getColorByHashString } from '../dashboard/AllLineschart/OperatorHbarChart/utils'
import { useAgencyList } from 'src/api/agencyList'
import useVehicleLocations from 'src/api/useVehicleLocations'
import dayjs from 'src/dayjs'
import { BusToolTip } from 'src/pages/components/map-related/MapLayers/BusToolTip'
import { INPUT_SIZE } from 'src/resources/sizes'
import '../Map.scss'

export interface Point {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: SiriVehicleLocationWithRelatedPydanticModel
  recorded_at_time?: number
}

interface Path {
  locations: SiriVehicleLocationWithRelatedPydanticModel[]
  lineRef: number
  operator: number
  vehicleRef: string
}

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

const rounded = (num?: number) => {
  return num ? Math.trunc(num * 1000) / 1000 : undefined
}

export default function TimeBasedMapPage() {
  const [map, setMap] = useState<Map | null>(null)
  const [bound, setBound] = useState<Record<string, number | undefined>>({
    latMax: undefined,
    latMin: undefined,
    lonMax: undefined,
    lonMin: undefined,
  })

  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const [from, setFrom] = useState(dayjs('2023-03-14T15:00:00Z'))
  const [to, setTo] = useState(dayjs(from).add(1, 'minutes'))

  const { locations, isLoading } = useVehicleLocations({
    from: from.valueOf(),
    to: to.valueOf(),
    ...bound,
    pause: !bound.latMax,
  })

  const { t } = useTranslation()

  const onMove = useCallback(() => {
    const bound = map?.getBounds()
    const sw = bound?.getSouthWest()
    const ne = bound?.getNorthEast()

    setBound({
      latMax: rounded(ne?.lat),
      lonMax: rounded(ne?.lng),
      latMin: rounded(sw?.lat),
      lonMin: rounded(sw?.lng),
    })
  }, [map])

  useEffect(() => {
    onMove()
    map?.on('moveend', onMove)
    return () => {
      map?.off('moveend', onMove)
    }
  }, [map, onMove])

  const positions = useMemo(() => {
    return locations.map<Point>((location) => ({
      loc: [location.lat!, location.lon!],
      color: location.velocity!,
      operator: location.siriRouteOperatorRef,
      bearing: location.bearing,
      recorded_at_time: location.recordedAtTime?.getTime(),
      point: location,
    }))
  }, [locations])

  const paths = useMemo(() => {
    return locations.reduce((arr: Path[], loc) => {
      const line = arr.find((line) => line.vehicleRef === loc.siriRideVehicleRef)
      if (!line) {
        arr.push({
          locations: [loc],
          lineRef: loc.siriRouteLineRef!,
          operator: loc.siriRouteOperatorRef!,
          vehicleRef: loc.siriRideVehicleRef!,
        })
      } else {
        line.locations.push(loc)
      }
      return arr
    }, [])
  }, [locations])

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
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        <Grid size={{ xs: 12 }} className="hideOnMobile">
          <Alert severity="info" variant="outlined" icon={false}>
            {t('time_based_map_page_description')}
          </Alert>
        </Grid>
        {/* from date */}
        <Grid size={{ xs: 2 }} className="hideOnMobile">
          <Label text={t('from_date')} />
        </Grid>
        <Grid size={{ sm: 5, xs: 6 }}>
          <DateSelector
            time={dayjs(to)}
            onChange={(ts) => {
              const val = ts ? ts : to
              setFrom(dayjs(val).subtract(dayjs(to).diff(dayjs(from)))) // keep the same time difference
              setTo(dayjs(val))
            }}
          />
        </Grid>
        <Grid size={{ sm: 5, xs: 6 }}>
          <TimeSelector
            time={dayjs(to)}
            onChange={(ts) => {
              const val = ts ? ts : from
              setFrom(dayjs(val).subtract(dayjs(to).diff(dayjs(from))))
              setTo(dayjs(val)) // keep the same time difference
            }}
          />
        </Grid>
        {/*minutes*/}
        <Grid size={{ sm: 5, xs: 12 }}>
          <Label text={t('watch_locations_in_range')} />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <MinuteSelector
            num={to.diff(from) / 1000 / 60}
            setNum={(num) => {
              setFrom(dayjs(to).subtract(Math.abs(+num) || 1, 'minutes'))
            }}
          />
        </Grid>
        <Grid size={{ xs: 1 }} className="hideOnMobile">
          <Label text={t('minutes')} />
        </Grid>
        {/* Buttons */}
        {/* loaded info */}
        <Grid size={{ xs: 11 }}>
          <p>
            {`${locations.length}- ${t('show_x_bus_locations')} ${t('from_time_x_to_time_y')
              .replace('XXX', dayjs(from).format('LT'))
              .replace('YYY', dayjs(to).format('LT'))}`}
          </p>
        </Grid>
        <Grid size={{ xs: 1 }}>{isLoading && <CircularProgress size="20px" />}</Grid>
      </Grid>
      <div className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <IconButton color="primary" className="expand-button" onClick={toggleExpanded}>
          <OpenInFullRounded fontSize="large" />
        </IconButton>
        <MapContainer ref={setMap} center={position.loc} zoom={13} minZoom={11} scrollWheelZoom>
          <TileLayer
            attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <Markers positions={positions} />
          {paths.map((path) => (
            <Polyline
              key={path.vehicleRef}
              pathOptions={{
                color: getColorByHashString(path.vehicleRef),
              }}
              positions={path.locations.map(({ lat, lon }) => [lat!, lon!])}
            />
          ))}
        </MapContainer>
      </div>
    </PageContainer>
  )
}

function Markers({ positions }: { positions: Point[] }) {
  const agencyList = useAgencyList()
  return (
    <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
      {positions.map((pos) => {
        const icon = busIcon({
          operator_id: pos.operator?.toString() || 'default',
          name: agencyList.find((agency) => agency.operator_ref === pos.operator)?.agency_name,
        })
        return (
          <Marker position={pos.loc} icon={icon} key={pos.point?.id}>
            <Popup minWidth={300} maxWidth={700}>
              <BusToolTip position={pos} icon={busIconPath(String(pos.operator))} />
            </Popup>
          </Marker>
        )
      })}
    </MarkerClusterGroup>
  )
}
