import { CloseFullscreenTwoTone, OpenInFullTwoTone } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { PropsWithChildren, ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AttributionControl, MapContainer, MapContainerProps } from 'react-leaflet'
import { useTheme } from 'src/layout/ThemeContext'
import { MapZoomBar } from './MapZoomBar'

/**
 * Shared shell for every map page: the `.map-info` wrapper (with the
 * expand/collapse + dark-theme classes) and a MapContainer whose controls are
 * placed direction-aware — the zoom bar at the inline-end with the
 * expand/collapse button as its bottom segment, attribution at the
 * inline-start. Pages pass the MapContainer props (center/zoom/…) and the
 * layers as children. An optional `legend` renders in the shared `.map-legend`
 * box (top inline-start corner) so every map page places and themes its legend
 * the same way — pages provide only the legend content.
 */
type MapShellProps = PropsWithChildren<MapContainerProps & { legend?: ReactNode }>

export function MapShell({ children, legend, ...mapProps }: MapShellProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const { isDarkTheme } = useTheme()
  const { i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  return (
    <div
      className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}${isDarkTheme ? ' dark' : ''}`}>
      {legend && <div className="map-legend">{legend}</div>}
      <MapContainer {...mapProps} zoomControl={false} attributionControl={false}>
        <MapZoomBar position={isRtl ? 'topleft' : 'topright'}>
          <IconButton className="expand-button" onClick={toggleExpanded}>
            {isExpanded ? (
              <CloseFullscreenTwoTone fontSize="small" />
            ) : (
              <OpenInFullTwoTone fontSize="small" />
            )}
          </IconButton>
        </MapZoomBar>
        <AttributionControl position={isRtl ? 'bottomright' : 'bottomleft'} prefix={false} />
        {children}
      </MapContainer>
    </div>
  )
}
