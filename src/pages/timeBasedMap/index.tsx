import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { OpenInFullRounded } from '@mui/icons-material'
import { Alert, CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import useVehicleLocations from 'src/api/useVehicleLocations'
import dayjs from 'src/dayjs'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { BusToolTip } from 'src/pages/components/map-related/MapLayers/BusToolTip'
import { INPUT_SIZE } from 'src/resources/sizes'
import { DateSelector } from '../components/DateSelector'
import { Label } from '../components/Label'
import MinuteSelector from '../components/MinuteSelector'
import { PageContainer } from '../components/PageContainer'
import { TimeSelector } from '../components/TimeSelector'
import { busIcon, busIconPath } from '../components/utils/BusIcon'
import createClusterCustomIcon from '../components/utils/customCluster/customCluster'
import InfoYoutubeModal from '../components/YoutubeModal'
import { getColorByHashString } from '../dashboard/AllLineschart/OperatorHbarChart/utils'
import '../Map.scss'

export interface Point {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: SiriVehicleLocationWithRelatedPydanticModel
  recordedAtTime?: number
}

interface Path {
  locations: SiriVehicleLocationWithRelatedPydanticModel[]
  lineRef: number
  operator: number
  vehicleRef: string
}

export default function TimeBasedMapPage() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const position: Point = {
    loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
    color: 0,
  }

  //TODO (another PR and another issue) load from url like in another pages.
  const [from, setFrom] = useState(dayjs('2023-03-14T15:00:00Z'))
  const [to, setTo] = useState(dayjs(from).add(1, 'minutes'))

  const { locations, isLoading } = useVehicleLocations({ from, to })

  const loaded = locations.length
  const { t } = useTranslation()

  const positions = useMemo(() => {
    const pos = locations.map<Point>((location) => ({
      loc: [location.lat!, location.lon!],
      color: location.velocity ?? 0,
      operator: location.siriRouteOperatorRef ?? 0,
      bearing: location.bearing ?? 0,
      recordedAtTime: location.recordedAtTime ? new Date(location.recordedAtTime).getTime() : 0,
      point: location,
    }))
    return pos
  }, [locations])

  const paths = useMemo(
    () =>
      locations.reduce((arr: Path[], loc) => {
        const line = arr.find((line) => line.vehicleRef === loc.siriRideVehicleRef)
        if (!line) {
          arr.push({
            locations: [loc],
            lineRef: loc.siriRouteLineRef || 0,
            operator: loc.siriRouteOperatorRef || 0,
            vehicleRef: loc.siriRideVehicleRef || '',
          })
        } else {
          line.locations.push(loc)
        }
        return arr
      }, []),
    [locations],
  )

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
    <PageContainer className="map-container">
      <Typography variant="h4" className="page-title">
        {t('time_based_map_page_title')}
        <InfoYoutubeModal
          label={t('open_video_about_this_page')}
          title={t('youtube_modal_info_title')}
          videoUrl="https://www.youtube-nocookie.com/embed/bXg50_j_hTA?si=t8PiTrTA1budRZg-&amp;start=150"
        />
      </Typography>
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        <Grid size={{ xs: 12 }} className="hideOnMobile">
          <Alert severity="info" variant="outlined" icon={false}>
            {t('time_based_map_page_description')}
          </Alert>
        </Grid>
        {/* from date */}
        <Grid size={{ xs: 2 }} className="hideOnMobile">
          <Label text={t('from_date')} />
        </Grid>
        <Grid size={{ sm: 5, xs: 6 }}>
          <DateSelector
            time={to}
            onChange={(ts) => {
              const val = ts ? ts : to
              setFrom(dayjs(val).subtract(dayjs(to).diff(dayjs(from)))) // keep the same time difference
              setTo(dayjs(val))
            }}
          />
        </Grid>
        <Grid size={{ sm: 5, xs: 6 }}>
          <TimeSelector
            time={to}
            onChange={(ts) => {
              const val = ts ? ts : from
              setFrom(dayjs(val).subtract(dayjs(to).diff(dayjs(from))))
              setTo(dayjs(val)) // keep the same time difference
            }}
          />
        </Grid>
        {/*minutes*/}
        <Grid size={{ sm: 5, xs: 12 }}>
          <Label text={t('watch_locations_in_range')} />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <MinuteSelector
            num={to.diff(from) / 1000 / 60}
            setNum={(num) => {
              setFrom(dayjs(to).subtract(Math.abs(+num) || 1, 'minutes'))
            }}
          />
        </Grid>
        <Grid size={{ xs: 1 }} className="hideOnMobile">
          <Label text={t('minutes')} />
        </Grid>
        {/* Buttons */}
        {/* loaded info */}
        <Grid size={{ xs: 11 }}>
          <p>
            {`${loaded}- ${t('show_x_bus_locations')} ${t('from_time_x_to_time_y')
              .replace('XXX', dayjs(from).format('LT'))
              .replace('YYY', dayjs(to).format('LT'))}`}
          </p>
        </Grid>
        <Grid size={{ xs: 1 }}>{isLoading && <CircularProgress size="20px" />}</Grid>
      </Grid>
      <div ref={mapContainerRef} className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <IconButton
          ref={buttonRef}
          color="primary"
          className="expand-button"
          onClick={toggleExpanded}>
          <OpenInFullRounded fontSize="large" />
        </IconButton>
        <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <Markers positions={positions} />
          {paths.map((path) => (
            <Polyline
              key={path.vehicleRef}
              pathOptions={{
                color: getColorByHashString(path.vehicleRef.toString()),
              }}
              positions={path.locations.map(({ lat, lon }) => [lat || 0, lon || 0])}
            />
          ))}
        </MapContainer>
      </div>
    </PageContainer>
  )
}

function Markers({ positions }: { positions: Point[] }) {
  const map = useMap()
  const agencyList = useAgencyList()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      map.flyTo([position.coords.latitude, position.coords.longitude], 13),
    )
  }, [map])

  return (
    <>
      <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
        {positions.map((pos) => {
          const icon = busIcon({
            operator_id: pos.operator?.toString() || 'default',
            name: agencyList.find((agency) => agency.operatorRef === pos.operator)?.agencyName,
          })
          return (
            <Marker position={pos.loc} icon={icon} key={pos.point?.id}>
              <Popup minWidth={300} maxWidth={700}>
                <BusToolTip position={pos} icon={busIconPath(String(pos.operator))} />
              </Popup>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </>
  )
}
