import type { ReactNode } from 'react'

export function MapIndex({
  lineColor,
  icon,
  title,
  subtitle,
}: {
  lineColor: string
  /** The marker as it appears on the map. An element rather than a URL, so a glyph drawn inline
   * (the bearing arrow) can be painted by the same stylesheet as its counterpart on the map. */
  icon: ReactNode
  title: string
  subtitle?: ReactNode
}) {
  return (
    <div className="map-index-item">
      <div className="map-index-item-config">
        <div className="map-index-item-icon">{icon}</div>
        <div className="map-index-item-line" style={{ backgroundColor: lineColor }} />
      </div>
      <div className="map-index-item-title">
        <h3>
          {title}
          {subtitle && <span>{subtitle}</span>}
        </h3>
      </div>
    </div>
  )
}
