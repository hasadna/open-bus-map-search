import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { Icon, IconOptions, LatLngTuple } from 'leaflet'
import { useAgencyList } from 'src/api/agencyList'
import { Point } from 'src/pages/timeBasedMap'
import { busIcon, busIconPath } from '../utils/BusIcon'
import { BusToolTip } from './MapLayers/BusToolTip'
import { VehicleLocation } from 'src/model/vehicleLocation'
import { useCallback, useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { BusStop } from 'src/model/busStop'
import { t } from 'i18next'
import '../../Map.scss'

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

interface MapProps {
  positions: Point[]
  plannedRouteStops: BusStop[]
}

export function MapWithLocationsAndPath({ positions, plannedRouteStops }: MapProps) {
  const agencyList = useAgencyList()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

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
    <div className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <IconButton
        color="primary"
        className="expand-button"
        onClick={toggleExpanded}
      >
        <OpenInFullRoundedIcon fontSize="large"/>
      </IconButton>

      <MapContainer center={position.loc} zoom={13} scrollWheelZoom={true}>
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
        <RecenterOnDataChange positions={positions} plannedRouteStops={plannedRouteStops} />
      </MapContainer>
    </div>
  )
}

export function MapIndex({
  lineColor,
  imgSrc,
  title,
}: {
  lineColor: string
  imgSrc: string
  title: string
}) {
  return (
    <div className="map-index-item">
      <div className="map-index-item-config">
        <p className="map-index-item-line" style={{ backgroundColor: lineColor }}></p>
        <p className="map-index-item-icon" style={{ backgroundImage: `url(${imgSrc})` }}>
          {/* <img src={imgSrc} alt="planned route stop icon" /> */}
        </p>
      </div>
      <div className="map-index-item-title">
        <h3>{title}</h3>
      </div>
    </div>
  )
}

function RecenterOnDataChange({ positions, plannedRouteStops }: MapProps) {
  const map = useMap()

  useEffect(() => {
    const positionsSum = positions.reduce(
      (acc, { loc }) => [acc[0] + loc[0], acc[1] + loc[1]],
      [0, 0],
    )
    const mean: LatLngTuple = [
      positionsSum[0] / positions.length || position.loc[0],
      positionsSum[1] / positions.length || position.loc[1],
    ]

    map.setView(mean, map.getZoom(), { animate: true })
  }, [positions, plannedRouteStops])

  return null
}
