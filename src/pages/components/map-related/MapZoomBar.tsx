import { Control, ControlPosition, DomEvent, DomUtil } from 'leaflet'
import { PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'

type MapZoomBarProps = PropsWithChildren<{ position: ControlPosition }>

/**
 * Leaflet's zoom control with extra buttons appended into the same
 * `.leaflet-bar`, so they read as one connected control rather than separate
 * boxes stacked in a corner. Zoom in/out stays Leaflet's own: it keeps the
 * disabled states at the zoom limits, the button titles and the keyboard
 * handling that a hand-rolled pair of buttons would have to reimplement.
 *
 * The slot is a stable node appended after `addTo`, so the container Leaflet
 * builds is never queried or patched from the outside — changing `position`
 * just rebuilds the control and re-appends the same slot.
 */
export function MapZoomBar({ position, children }: MapZoomBarProps) {
  const map = useMap()
  const [slot] = useState(() => DomUtil.create('div', 'map-zoom-bar-slot'))

  useEffect(() => {
    // Without this a click on the button also reaches the map and pans/zooms it.
    DomEvent.disableClickPropagation(slot)
    DomEvent.disableScrollPropagation(slot)
  }, [slot])

  useEffect(() => {
    const control = new Control.Zoom({ position })
    control.addTo(map)
    control.getContainer()?.appendChild(slot)
    return () => {
      control.remove()
    }
  }, [map, position, slot])

  return createPortal(children, slot)
}
