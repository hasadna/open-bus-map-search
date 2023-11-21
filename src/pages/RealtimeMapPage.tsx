import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { TEXTS } from 'src/resources/texts'

import { Spin } from 'antd'
import moment from 'moment'
import getAgencyList, { Agency } from 'src/api/agencyList'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { VehicleLocation } from 'src/model/vehicleLocation'
import './Map.scss'
import { DateSelector } from './components/DateSelector'
import MinuteSelector from './components/MinuteSelector'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import { PageContainer } from './components/PageContainer'
import { INPUT_SIZE } from 'src/resources/sizes'
import { Label } from './components/Label'
import { getColorByHashString } from './dashboard/OperatorHbarChart/utils'
import createClusterCustomIcon from './components/utils/customCluster/customCluster'
import { TimeSelector } from './components/TimeSelector'
import { busIcon, busIconPath } from './components/utils/BusIcon'
import { BusToolTip } from 'src/pages/components/MapLayers/BusToolTip'

export interface Point {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: VehicleLocation
  recorded_at_time?: number
}

interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}

const fiveMinutesAgo = moment().subtract(5, 'minutes')
const fourMinutesAgo = moment(fiveMinutesAgo).add(1, 'minutes')

export default function RealtimeMapPage() {
  const position: Point = {
    loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
    color: 0,
  }

  //TODO (another PR and another issue) load from url like in another pages.
  const [from, setFrom] = useState(fiveMinutesAgo)
  const [to, setTo] = useState(fourMinutesAgo)

  const { locations, isLoading } = useVehicleLocations({
    from,
    to,
  })

  const loaded = locations.length

  const positions = useMemo(() => {
    const pos = locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: location.siri_route__operator_ref,
      bearing: location.bearing,
      recorded_at_time: new Date(location.recorded_at_time).getTime(),
      point: location,
    }))
    return pos
  }, [locations])

  const paths = useMemo(
    () =>
      locations.reduce((arr: Path[], loc) => {
        const line = arr.find((line) => line.vehicleRef === loc.siri_ride__vehicle_ref)
        if (!line) {
          arr.push({
            locations: [loc],
            lineRef: loc.siri_route__line_ref,
            operator: loc.siri_route__operator_ref,
            vehicleRef: loc.siri_ride__vehicle_ref,
          })
        } else {
          line.locations.push(loc)
        }
        return arr
      }, []),
    [locations],
  )

  return (
    <PageContainer className="map-container">
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        <Grid xs={12}>
          <Label text={TEXTS.realtime_map_explanation} />
        </Grid>
        {/* from date */}
        <Grid xs={2}>
          <Label text={TEXTS.from_date} />
        </Grid>
        <Grid xs={5}>
          <DateSelector
            time={to}
            onChange={(ts) => {
              const val = ts ? ts : to
              setFrom(moment(val).subtract(moment(to).diff(moment(from)))) // keep the same time difference
              setTo(moment(val))
            }}
          />
        </Grid>
        <Grid xs={5}>
          <TimeSelector
            time={to}
            onChange={(ts) => {
              const val = ts ? ts : from
              setFrom(moment(val).subtract(moment(to).diff(moment(from))))
              setTo(moment(val)) // keep the same time difference
            }}
          />
        </Grid>
        {/*minutes*/}
        <Grid xs={5}>
          <Label text={TEXTS.watch_locations_in_range} />
        </Grid>
        <Grid xs={6}>
          <MinuteSelector
            num={to.diff(from) / 1000 / 60}
            setNum={(num) => {
              setFrom(moment(to).subtract(Math.abs(+num) || 1, 'minutes'))
            }}
          />
        </Grid>
        <Grid xs={1}>
          <Label text={TEXTS.minutes} />
        </Grid>
        {/* Buttons */}
        {/*TODO (another PR another issue)
          3) use text `TEXTS`.
        */}
        {/* loaded info */}
        <Grid xs={11}>
          <p>
            {loaded} {`- `}
            {TEXTS.show_x_bus_locations} {` `}
            {TEXTS.from_time_x_to_time_y
              .replace('XXX', moment(from).format('hh:mm A'))
              .replace('YYY', moment(to).format('hh:mm A'))}
          </p>
        </Grid>
        <Grid xs={1}>{isLoading && <Spin size="small" />}</Grid>
      </Grid>
      <div className="map-info">
        <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <Markers positions={positions} />
          {paths.map((path) => (
            <Polyline
              key={path.vehicleRef}
              pathOptions={{
                color: getColorByHashString(path.vehicleRef.toString()),
              }}
              positions={path.locations.map(({ lat, lon }) => [lat, lon])}
            />
          ))}
        </MapContainer>
      </div>
    </PageContainer>
  )
}

function Markers({ positions }: { positions: Point[] }) {
  const map = useMap()
  const [agencyList, setAgencyList] = useState<Agency[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList).catch(console.log)
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      map.flyTo([position.coords.latitude, position.coords.longitude], 13),
    )
  }, [])

  return (
    <>
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
    </>
  )
}
