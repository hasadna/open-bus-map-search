import { Icon, IconOptions } from 'leaflet'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TileLayer } from 'react-leaflet'
import { MapProps } from './map-types'
import { MapHeatmapLayer } from './MapLayers/MapHeatmapLayer'
import { MapIndexLayer } from './MapLayers/MapIndexLayer'
import { MapPlannedRouteLayer } from './MapLayers/MapPlannedRouteLayer'
import { MapRouteLayer } from './MapLayers/MapRouteLayer'
import { useRecenterOnDataChange } from './useRecenterOnDataChange'

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
  heatmapMode,
}: MapProps) {
  const [tileUrl, setTileUrl] = useState('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png')
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
  }, [i18n])

  return (
    <>
      <TileLayer
        attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={tileUrl}
      />

      <MapIndexLayer
        actualRouteLineColor={actualRouteLineColor}
        actualRouteStopMarkerPath={actualRouteStopMarkerPath}
        heatmapMode={heatmapMode}
        plannedRouteLineColor={plannedRouteLineColor}
        plannedRouteStopMarkerPath={plannedRouteStopMarkerPath}
        showPlannedRoute={!!plannedRouteStops}
      />

      {heatmapMode ? (
        <MapHeatmapLayer positions={positions} />
      ) : (
        <MapRouteLayer
          actualRouteLineColor={actualRouteLineColor}
          actualRouteStopMarker={actualRouteStopMarker}
          positions={positions}
          showNavigationButtons={showNavigationButtons}
        />
      )}

      {plannedRouteStops?.length ? (
        <MapPlannedRouteLayer
          plannedRouteLineColor={plannedRouteLineColor}
          plannedRouteStopMarker={plannedRouteStopMarker}
          plannedRouteStops={plannedRouteStops}
        />
      ) : null}
    </>
  )
}
