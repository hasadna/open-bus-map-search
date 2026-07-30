import { CloseFullscreenTwoTone, OpenInFullTwoTone } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { PropsWithChildren, ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AttributionControl, MapContainer, MapContainerProps, ZoomControl } from 'react-leaflet'
import { useTheme } from 'src/layout/ThemeContext'

/**
 * Shared shell for every map page: the `.map-info` wrapper (with the
 * expand/collapse + dark-theme classes), the floating expand button, and a
 * MapContainer whose zoom/attribution controls are placed direction-aware
 * (zoom at the inline-end, attribution at the inline-start). Pages pass the
 * MapContainer props (center/zoom/…) and the layers as children. An optional
 * `legend` renders in the shared `.map-legend` box (top inline-start corner)
 * so every map page places and themes its legend the same way — pages provide
 * only the legend content.
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
      <IconButton color="primary" className="expand-button" onClick={toggleExpanded}>
        {isExpanded ? (
          <CloseFullscreenTwoTone fontSize="large" />
        ) : (
          <OpenInFullTwoTone fontSize="large" />
        )}
      </IconButton>
      {legend && <div className="map-legend">{legend}</div>}
      <MapContainer {...mapProps} zoomControl={false} attributionControl={false}>
        <ZoomControl position={isRtl ? 'topleft' : 'topright'} />
        <AttributionControl position={isRtl ? 'bottomright' : 'bottomleft'} prefix={false} />
        {children}
      </MapContainer>
    </div>
  )
}
