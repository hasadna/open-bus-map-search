import { t } from 'i18next'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { Icon, IconOptions, Marker as LeafletMarker } from 'leaflet'
import { busIcon, busIconPath } from '../utils/BusIcon'
import { BusToolTip } from './MapLayers/BusToolTip'
import '../../Map.scss'
import { MapProps } from './map-types'
import { useRecenterOnDataChange } from './useRecenterOnDataChange'
import { MapIndex } from './MapIndex'
import MapFooterButtons from './MapFooterButtons/MapFooterButtons'
import { useAgencyList } from 'src/api/agencyList'

// configs for planned & actual routes - line color & marker icon
const getIcon = (path: string, width: number = 10, height: number = 10): Icon<IconOptions> => {
  return new Icon<IconOptions>({
    iconUrl: path,
    iconSize: [width, height],
  })
}
const actualRouteStopMarkerPath = '/marker-dot.png'
const plannedRouteStopMarkerPath = '/marker-bus-stop.png'
const actualRouteLineColor = 'orange'
const plannedRouteLineColor = 'black'
const actualRouteStopMarker = getIcon(actualRouteStopMarkerPath, 20, 20)
const plannedRouteStopMarker = getIcon(plannedRouteStopMarkerPath, 20, 25)

export function MapContent({
  positions,
  plannedRouteStops,
  showNavigationButtons,
  showPlannedRoute = true,
}: MapProps) {
  const markerRef = useRef<{ [key: number]: LeafletMarker | null }>({})
  const [tileUrl, setTileUrl] = useState('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png')

  const agencyList = useAgencyList()
  const map = useMap()
  const { i18n } = useTranslation()

  useRecenterOnDataChange({ positions, plannedRouteStops })

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const newUrl =
        lng === 'he'
          ? 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png'
          : 'https://tile-a.openstreetmap.fr/osmfr/{z}/{x}/{y}.png?lang=en'
      setTileUrl(newUrl)
    }
    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  const navigateMarkers = useCallback(
    (positionId: number) => {
      const pos = positions[positionId]
      if (!map || !pos?.loc) return
      const marker = markerRef.current[positionId]
      if (marker) {
        map.flyTo(pos.loc, map.getZoom())
        marker.openPopup()
      }
    },
    [map, positions],
  )

  return (
    <>
      <TileLayer
        attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={tileUrl}
      />
      <div className="map-index">
        <MapIndex
          lineColor={actualRouteLineColor}
          imgSrc={actualRouteStopMarkerPath}
          title={t('actualRoute')}
        />
        {showPlannedRoute && (
          <MapIndex
            lineColor={plannedRouteLineColor}
            imgSrc={plannedRouteStopMarkerPath}
            title={t('plannedRoute')}
          />
        )}
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
          <Marker
            ref={(ref) => {
              markerRef.current[i] = ref
            }}
            position={pos.loc}
            icon={icon}
            key={i}>
            <Popup minWidth={300} maxWidth={700}>
              <BusToolTip position={pos} icon={busIconPath(pos.operator!)}>
                {showNavigationButtons && (
                  <MapFooterButtons
                    index={i}
                    positions={positions}
                    navigateMarkers={navigateMarkers}
                  />
                )}
              </BusToolTip>
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
            <Marker key={stop.key} position={[latitude, longitude]} icon={plannedRouteStopMarker} />
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
