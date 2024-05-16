import { Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { Icon, IconOptions } from 'leaflet'
import { useAgencyList } from 'src/api/agencyList'
import { busIcon, busIconPath } from '../utils/BusIcon'
import { BusToolTip } from './MapLayers/BusToolTip'
import { t } from 'i18next'
import '../../Map.scss'
import { MapProps } from './map-types'
import { useRecenterOnDataChange } from './useRecenterOnDataChange'
import { MapIndex } from './MapIndex'


export function MapContent({ positions, plannedRouteStops, position }: MapProps) {
  useRecenterOnDataChange({ positions, plannedRouteStops, position })

  const agencyList = useAgencyList()

  const getIcon = (path: string, width: number = 10, height: number = 10): Icon<IconOptions> => {
    return new Icon<IconOptions>({
      iconUrl: path,
      iconSize: [width, height],
    })
  }
  // configs for planned & actual routes - line color & marker icon
  const actualRouteStopMarkerPath = '/marker-dot.png'
  const plannedRouteStopMarkerPath = '/marker-bus-stop.png'
  const actualRouteLineColor = 'orange'
  const plannedRouteLineColor = 'black'
  const actualRouteStopMarker = getIcon(actualRouteStopMarkerPath, 20, 20)
  const plannedRouteStopMarker = getIcon(plannedRouteStopMarkerPath, 20, 25)

  return (
    <>
      <TileLayer
        attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      />
      <div className="map-index">
        <MapIndex
          lineColor={actualRouteLineColor}
          imgSrc={actualRouteStopMarkerPath}
          title={t('actualRoute')}
        />
        <MapIndex
          lineColor={plannedRouteLineColor}
          imgSrc={plannedRouteStopMarkerPath}
          title={t('plannedRoute')}
        />
      </div>
      {positions.map((pos, i) => {
        const icon =
          i === 0
            ? busIcon({
                operator_id: pos.operator?.toString() || 'default',
                name: agencyList.find((agency) => agency.operator_ref === pos.operator)
                  ?.agency_name,
              })
            : actualRouteStopMarker
        return (
          <Marker position={pos.loc} icon={icon} key={i}>
            <Popup minWidth={300} maxWidth={700}>
              <BusToolTip position={pos} icon={busIconPath(pos.operator!)} />
            </Popup>
          </Marker>
        )
      })}

      {plannedRouteStops?.length && (
        <Polyline
          pathOptions={{ color: plannedRouteLineColor }}
          positions={plannedRouteStops.map((stop) => [
            stop.location.latitude,
            stop.location.longitude,
          ])}
        />
      )}
      {plannedRouteStops?.length &&
        plannedRouteStops.map((stop) => {
          const { latitude, longitude } = stop.location
          return (
            <Marker
              key={'' + latitude + longitude}
              position={[latitude, longitude]}
              icon={plannedRouteStopMarker}></Marker>
          )
        })}
      {positions.length && (
        <Polyline
          pathOptions={{ color: actualRouteLineColor }}
          positions={positions.map((position) => position.loc)}
        />
      )}
    </>
  )
}
