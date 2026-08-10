import { DivIcon, Icon, IconOptions, Layer } from 'leaflet'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TileLayer, useMap } from 'react-leaflet'
import { MapProps } from './map-types'
import { MapPlannedRouteLayer } from './MapLayers/MapPlannedRouteLayer'
import { MapRouteLayer } from './MapLayers/MapRouteLayer'
import { useRecenterOnDataChange } from './useRecenterOnDataChange'

const getIcon = (
  path: string,
  width: number = 10,
  height: number = 10,
  className?: string,
): Icon<IconOptions> => {
  return new Icon<IconOptions>({
    iconUrl: path,
    iconSize: [width, height],
    className,
  })
}

/** Carried by both vehicle-ping shapes (dot and bearing arrow) so a ping can be selected
 * without knowing which of the two it got. */
export const vehiclePingMarkerClass = 'vehicle-ping-marker'

export const actualRouteLineColor = 'orange'
export const actualRouteStopMarkerPath = `${import.meta.env.BASE_URL}marker-dot.png`
export const actualRouteStopMarker = getIcon(
  actualRouteStopMarkerPath,
  20,
  20,
  vehiclePingMarkerClass,
)

export const vehicleBearingMarkerPath = `${import.meta.env.BASE_URL}marker-arrow.svg`

const bearingMarkers = new Map<number, DivIcon>()

/**
 * Arrow marker pointing where the vehicle was heading, from the ping's SIRI bearing
 * (0 = north, clockwise — the same convention as a CSS rotation).
 *
 * The rotation sits on the inner `img` because Leaflet owns the outer element's `transform`
 * to position the marker. Instances are cached per whole degree so a ride's hundreds of
 * pings share at most 360 icons, and re-renders reuse the same object.
 */
export const vehicleBearingMarker = (bearing: number): DivIcon => {
  const deg = ((Math.round(bearing) % 360) + 360) % 360
  const cached = bearingMarkers.get(deg)
  if (cached) return cached

  const icon = new DivIcon({
    className: `${vehiclePingMarkerClass} vehicle-bearing-marker`,
    iconSize: [20, 20],
    html: `<img src="${vehicleBearingMarkerPath}" alt="" style="transform: rotate(${deg}deg)" />`,
  })
  bearingMarkers.set(deg, icon)
  return icon
}

export const plannedRouteLineColor = 'black'
export const plannedRouteStopMarkerPath = `${import.meta.env.BASE_URL}marker-bus-stop.png`
export const plannedRouteStopMarker = getIcon(plannedRouteStopMarkerPath, 20, 25)

export function MapContent({
  positionGroups,
  plannedRouteStops,
  showNavigationButtons,
  focusTarget,
}: MapProps) {
  const [tileUrl, setTileUrl] = useState('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png')
  const map = useMap()
  const { i18n } = useTranslation()

  useRecenterOnDataChange({ positionGroups, plannedRouteStops })

  // Fly to (and scroll into view) an externally requested location — e.g. clicking a
  // coverage-gap's geomarker focuses the last-seen ping before the bus went dark.
  useEffect(() => {
    if (!map || !focusTarget) return
    map.flyTo(focusTarget.loc, Math.max(map.getZoom(), 16))
    map.getContainer().scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [map, focusTarget])

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
  }, [i18n])

  const navigateMarkers = useCallback(
    (groupIndex: number, positionId: number, marker: Layer) => {
      const pos = positionGroups[groupIndex]?.positions[positionId]
      if (!map || !pos?.loc) return
      map.flyTo(pos.loc, map.getZoom())
      marker.openPopup()
    },
    [map, positionGroups],
  )

  return (
    <>
      <TileLayer
        attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={tileUrl}
      />
      <MapRouteLayer
        positionGroups={positionGroups}
        showNavigationButtons={showNavigationButtons}
        navigateMarkers={navigateMarkers}
      />
      <MapPlannedRouteLayer plannedRouteStops={plannedRouteStops} />
    </>
  )
}
