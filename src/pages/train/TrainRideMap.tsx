import { Box } from '@mui/material'
import { useMemo } from 'react'
import type { BusStop } from 'src/model/busStop'
import {
  type PositionGroup,
  ROUTE_COLORS,
  toPoint,
} from 'src/pages/components/map-related/map-types'
import { MapWithLocationsAndPath } from 'src/pages/components/map-related/MapWithLocationsAndPath'
import { vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import type { TrainRideData } from './trainData'

export function TrainRideMap({ ride }: Readonly<{ ride: TrainRideData }>) {
  const positionGroups = useMemo<PositionGroup[]>(() => {
    const positions = ride.locations
      .filter(({ lat, lon }) => Number.isFinite(lat) && Number.isFinite(lon))
      .map(toPoint)
    if (positions.length === 0) return []
    return [
      {
        positions,
        color: ROUTE_COLORS[0],
        label: vehicleIDFormat(ride.vehicleRef),
        vehicleRef: ride.vehicleRef,
      },
    ]
  }, [ride.locations, ride.vehicleRef])

  const plannedRouteStops = useMemo<BusStop[]>(
    () =>
      ride.stops.flatMap((stop, index) => {
        if (!Number.isFinite(stop.gtfsStopLat) || !Number.isFinite(stop.gtfsStopLon)) return []
        return [
          {
            date: stop.gtfsStopDate ?? new Date(0),
            key: `${stop.gtfsStopId ?? stop.id ?? index}-${stop.stopSequence ?? index}`,
            stopId: stop.gtfsStopId ?? 0,
            routeId: stop.gtfsRideGtfsRouteId ?? 0,
            stopSequence: stop.stopSequence ?? 0,
            name: stop.gtfsStopName ?? '',
            code: String(stop.gtfsStopCode ?? ''),
            location: {
              latitude: stop.gtfsStopLat!,
              longitude: stop.gtfsStopLon!,
            },
            minutesFromRouteStartTime: 0,
          },
        ]
      }),
    [ride.stops],
  )
  return (
    <Box sx={{ mt: 1.5, maxHeight: 728, display: 'flex', overflow: 'hidden' }}>
      <MapWithLocationsAndPath
        positionGroups={positionGroups}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons
      />
    </Box>
  )
}
