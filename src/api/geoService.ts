import { computeDestinationPoint, findNearest } from 'geolib'
import { Coordinates, CoordinatesBoundary } from 'src/model/location'
import { log } from 'src/log'

export function geoLocationBoundary(location: Coordinates, byMeters: number): CoordinatesBoundary {
  const moveUp = computeDestinationPoint(location, byMeters, 0)
  const moveDown = computeDestinationPoint(location, byMeters, 180)
  const moveRight = computeDestinationPoint(location, byMeters, 90)
  const moveLeft = computeDestinationPoint(location, byMeters, 270)
  const boundary = {
    lowerBound: { longitude: moveLeft.longitude, latitude: moveDown.latitude },
    upperBound: { longitude: moveRight.longitude, latitude: moveUp.latitude },
  }
  log('getting boundary', { location, byMeters, boundary })
  return boundary
}

export function nearestLocation(target: Coordinates, locations: Coordinates[]): Coordinates {
  return findNearest(target, locations) as Coordinates
}
