import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { useAgencyList } from 'src/api/agencyList'
import { Point } from 'src/pages/realtimeMap'
import { busIcon, busIconPath } from '../utils/BusIcon'
import { BusToolTip } from './MapLayers/BusToolTip'
import { VehicleLocation } from 'src/model/vehicleLocation'
import { getColorByHashString } from 'src/pages/dashboard/AllLineschart/OperatorHbarChart/utils'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}
export interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}
export function MapWithLocationsAndPath({
  positions,
  paths,
}: {
  positions: Point[]
  paths: Path[]
}) {
  const agencyList = useAgencyList()

  return (
    <div className="map-info">
      <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {positions.map((pos, i) => {
          const icon = busIcon({
            operator_id: pos.operator?.toString() || 'default',
            name: agencyList.find((agency) => agency.operator_ref === pos.operator)?.agency_name,
          })
          return (
            <Marker position={pos.loc} icon={icon} key={i}>
              <Popup minWidth={300} maxWidth={700}>
                <BusToolTip position={pos} icon={busIconPath(pos.operator!)} />
              </Popup>
            </Marker>
          )
        })}

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
  )
}
