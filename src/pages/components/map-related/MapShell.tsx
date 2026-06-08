import { OpenInFullRounded } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { PropsWithChildren, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AttributionControl, MapContainer, MapContainerProps, ZoomControl } from 'react-leaflet'
import { useConstrainedFloatingButton } from 'src/hooks/useConstrainedFloatingButton'
import { useTheme } from 'src/layout/ThemeContext'

/**
 * Shared shell for every map page: the `.map-info` wrapper (with the
 * expand/collapse + dark-theme classes), the floating expand button, and a
 * MapContainer whose zoom/attribution controls are placed direction-aware
 * (zoom at the inline-end, attribution at the inline-start). Pages pass the
 * MapContainer props (center/zoom/…) and the layers as children.
 */
export function MapShell({ children, ...mapProps }: PropsWithChildren<MapContainerProps>) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  useConstrainedFloatingButton(mapContainerRef, buttonRef, isExpanded)

  const { isDarkTheme } = useTheme()
  const { i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  return (
    <div
      ref={mapContainerRef}
      className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}${isDarkTheme ? ' dark' : ''}`}>
      <IconButton
        ref={buttonRef}
        color="primary"
        className="expand-button"
        onClick={toggleExpanded}>
        <OpenInFullRounded fontSize="large" />
      </IconButton>
      <MapContainer {...mapProps} zoomControl={false} attributionControl={false}>
        <ZoomControl position={isRtl ? 'topleft' : 'topright'} />
        <AttributionControl position={isRtl ? 'bottomright' : 'bottomleft'} prefix={false} />
        {children}
      </MapContainer>
    </div>
  )
}
