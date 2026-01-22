import { OpenInFullRounded } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer } from 'react-leaflet'
import { Point } from 'src/pages/timeBasedMap'
import { MapProps } from './map-types'
import { MapContent } from './MapContent'
import '../../Map.scss'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

export function MapWithLocationsAndPath({
  positions,
  plannedRouteStops,
  showNavigationButtons,
}: MapProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const updateButtonPosition = () => {
      if (!mapContainerRef.current || !buttonRef.current) return

      const mapRect = mapContainerRef.current.getBoundingClientRect()
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const buttonHeight = buttonRect.height || 48
      const offset = 5

      // Check if map is visible in viewport
      const mapTop = mapRect.top
      const mapBottom = mapRect.bottom
      const mapVisible = mapBottom > 0 && mapTop < window.innerHeight

      // If map is not visible, hide the button
      if (!mapVisible) {
        const buttonElement = buttonRef.current
        if (buttonElement) {
          buttonElement.style.display = 'none'
        }
        return
      }

      // Show button if map is visible
      const buttonElement = buttonRef.current
      if (buttonElement) {
        buttonElement.style.display = ''
      }

      // Desired position: 5px from viewport bottom (floating)
      const desiredBottomFromViewportBottom = offset
      const desiredTopFromViewportTop = window.innerHeight - buttonHeight - offset
      const desiredBottomFromViewportTop = window.innerHeight - desiredBottomFromViewportBottom

      let finalTop: number | undefined
      let finalBottom: number | undefined

      // Calculate button's actual position bounds
      const buttonTopFromViewportTop = desiredTopFromViewportTop
      const buttonBottomFromViewportTop = desiredBottomFromViewportTop

      // Check if button would be outside map bounds
      // If button top would be above map top, constrain to map top
      if (buttonTopFromViewportTop < mapTop) {
        finalTop = mapTop + offset
        finalBottom = undefined
      }
      // If button bottom would be below map bottom, constrain to map bottom
      else if (buttonBottomFromViewportTop > mapBottom) {
        // Position button at offset pixels above map bottom
        // Map bottom is mapBottom pixels from viewport top
        // Button bottom should be (mapBottom - offset) pixels from viewport top
        // Convert to distance from viewport bottom: window.innerHeight - (mapBottom - offset)
        const constrainedBottomFromTop = mapBottom - offset
        // Ensure button doesn't go above map top
        if (constrainedBottomFromTop - buttonHeight < mapTop) {
          // Map is too small, stick to top instead
          finalTop = mapTop + offset
          finalBottom = undefined
        } else {
          finalBottom = window.innerHeight - constrainedBottomFromTop
          finalTop = undefined
        }
      }
      // Otherwise, float at desired position
      else {
        finalBottom = desiredBottomFromViewportBottom
        finalTop = undefined
      }

      // Apply styles directly to the button element
      if (buttonElement) {
        buttonElement.style.position = 'fixed'
        buttonElement.style.left = `${mapRect.left + offset}px`
        buttonElement.style.zIndex = '2000' // Higher than Leaflet controls (typically 1000)
        if (finalTop !== undefined) {
          buttonElement.style.top = `${finalTop}px`
          buttonElement.style.bottom = ''
        } else if (finalBottom !== undefined) {
          buttonElement.style.bottom = `${finalBottom}px`
          buttonElement.style.top = ''
        }
      }
    }

    // Use IntersectionObserver to detect when map enters/exits viewport
    let intersectionObserver: IntersectionObserver | null = null
    if (mapContainerRef.current) {
      intersectionObserver = new IntersectionObserver(
        () => {
          updateButtonPosition()
        },
        {
          threshold: 0,
          rootMargin: '0px',
        },
      )
      intersectionObserver.observe(mapContainerRef.current)
    }

    // Initial update after DOM is ready
    const timeoutId = setTimeout(() => {
      updateButtonPosition()
    }, 100)

    // Update on scroll and resize
    window.addEventListener('scroll', updateButtonPosition, { passive: true })
    window.addEventListener('resize', updateButtonPosition)

    // Also update periodically to catch any missed updates
    const intervalId = setInterval(updateButtonPosition, 100)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      if (intersectionObserver) {
        intersectionObserver.disconnect()
      }
      window.removeEventListener('scroll', updateButtonPosition)
      window.removeEventListener('resize', updateButtonPosition)
    }
  }, [isExpanded])

  return (
    <div ref={mapContainerRef} className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <IconButton
        ref={buttonRef}
        color="primary"
        className="expand-button"
        onClick={toggleExpanded}>
        <OpenInFullRounded fontSize="large" />
      </IconButton>

      <MapContainer center={position.loc} zoom={13} scrollWheelZoom={true}>
        <MapContent
          positions={positions}
          plannedRouteStops={plannedRouteStops}
          showNavigationButtons={showNavigationButtons}
        />
      </MapContainer>
    </div>
  )
}
