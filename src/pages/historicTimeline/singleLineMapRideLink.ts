import { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { toIsraelTimezone } from 'src/dayjs'
import { toCivilDate } from 'src/model/time/civilDate'
import { locationFixKey } from 'src/pages/components/map-related/map-types'
import { formatStartTimeForQuery } from 'src/pages/components/utils/startTimeUtils'

type SelectedLine = { operatorId: string; lineNumber: string; routeKey: string }

/**
 * A URL that opens the ride a SIRI stop-hit came from on /single-line-map, down to the ping.
 *
 * Everything travels in the query string, which is why the link must be followed as a real
 * document navigation (`reloadDocument`) rather than a client-side one: MainRoute reads URL
 * params once, at app mount, and then strips them. The vehicle-number link out of
 * /single-line-map works the same way.
 *
 * The ping is namespaced `single-line-map.focusPing` because it is a param of that page
 * alone, not a global search key — /timeline has no use for it.
 *
 * The date comes from the ride's own scheduled departure rather than the day being
 * browsed: the timeline searches ±4h, so a hit near midnight can belong to the
 * neighbouring day, and that is the day whose departure list holds it.
 */
export function buildSingleLineMapRideLink(
  hit: SiriVehicleLocationWithRelatedPydanticModel,
  { operatorId, lineNumber, routeKey }: SelectedLine,
): string | undefined {
  if (!hit.siriRideScheduledStartTime) return undefined

  const departure = toIsraelTimezone(hit.siriRideScheduledStartTime)
  const departureDay = toCivilDate(departure)
  if (!departureDay) return undefined

  const params = new URLSearchParams({
    date: departureDay,
    operatorId,
    lineNumber,
    routeKey,
    rideTime: formatStartTimeForQuery(departure.format('HH:mm')),
    'single-line-map.focusPing': locationFixKey(hit),
  })

  return `/single-line-map?${params.toString()}`
}
