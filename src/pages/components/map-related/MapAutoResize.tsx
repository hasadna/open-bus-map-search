import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Keeps Leaflet's cached container size in step with the actual box.
 *
 * Leaflet measures the container once, when the map is created, and re-measures
 * only on a window `resize` or an explicit `invalidateSize()`. So anything that
 * resizes the map without resizing the window leaves it drawing for the old box:
 * the expand button (which switches `.map-info` to `position: fixed`) leaves the
 * new area blank, and a map mounted while its container is hidden keeps a size
 * of 0×0 — one tile loaded, every overlay path clipped away to an empty `d`.
 */
export function MapAutoResize() {
  const map = useMap()

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  return null
}
