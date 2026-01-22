import { OpenInFullRounded } from '@mui/icons-material'
import { IconButton, Stack } from '@mui/material'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import dayjs from 'src/dayjs'
import { SearchContext } from '../../model/pageState'
import { DateNavigator } from '../components/dateNavigator/DateNavigator'
import { DateSelector } from '../components/DateSelector'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './components/VelocityHeatmapRectangles'
import 'leaflet/dist/leaflet.css'
import '../Map.scss'

const VIS_MODES = [
  { key: 'avg', label: 'Visualize Avg Speed' },
  { key: 'std', label: 'Visualize Std' },
  { key: 'cv', label: 'Visualize Std / Avg Speed (Coeff of Var)' },
]

const DEFAULT_ZOOM_LEVEL = 10

const VelocityHeatmapPage: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const { search, setSearch } = useContext(SearchContext)

  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? +new Date('2026-01-01') }))
  }

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
    <div>
      <h1>Velocity Aggregation Heatmap</h1>
      <p>This page will display a heatmap of velocity aggregation data.</p>

      {/* choose date*/}
      <Stack direction="column" spacing={2} sx={{ mb: 2, width: { xs: '100%', md: '70%' } }}>
        <DateSelector time={dayjs(search.timestamp)} onChange={handleTimestampChange} />
        <DateNavigator currentTime={dayjs(search.timestamp)} onChange={handleTimestampChange} />
      </Stack>
      <div style={{ margin: '12px 0' }}>
        <b>Visualization:</b>{' '}
        {VIS_MODES.map((mode) => (
          <label key={mode.key} style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="visMode"
              value={mode.key}
              checked={visMode === mode.key}
              onChange={() => setVisMode(mode.key as 'avg' | 'std' | 'cv')}
            />{' '}
            {mode.label}
          </label>
        ))}
      </div>

      <div ref={mapContainerRef} className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <IconButton
          ref={buttonRef}
          color="primary"
          className="expand-button"
          onClick={toggleExpanded}>
          <OpenInFullRounded fontSize="large" />
        </IconButton>
        <MapContainer
          center={[29.65, 34.6]}
          zoom={DEFAULT_ZOOM_LEVEL}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <VelocityHeatmapRectangles
            visMode={visMode}
            setMinMax={(min, max) => {
              setMin(min)
              setMax(max)
            }}
          />
          <VelocityHeatmapLegend visMode={visMode} min={min} max={max} />
        </MapContainer>
      </div>
    </div>
  )
}

export default VelocityHeatmapPage
