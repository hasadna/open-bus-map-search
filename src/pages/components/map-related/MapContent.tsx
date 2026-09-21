import { Layer } from 'leaflet'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TileLayer, useMap } from 'react-leaflet'
import { MapProps } from './map-types'
import { MapPlannedRouteLayer } from './MapLayers/MapPlannedRouteLayer'
import { MapRouteLayer } from './MapLayers/MapRouteLayer'
import { useRecenterOnDataChange } from './useRecenterOnDataChange'

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
        focusTarget={focusTarget}
      />
      <MapPlannedRouteLayer plannedRouteStops={plannedRouteStops} />
    </>
  )
}
