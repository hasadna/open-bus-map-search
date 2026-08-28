import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { locationFixKey } from 'src/pages/components/map-related/map-types'
import { buildSingleLineMapRideLink } from './singleLineMapRideLink'

const LINE = { operatorId: '3', lineNumber: '480', routeKey: '10480-1-#' }

const hit = (
  fields: Partial<SiriVehicleLocationWithRelatedPydanticModel> = {},
): SiriVehicleLocationWithRelatedPydanticModel => ({
  id: 8456739521,
  siriRideVehicleRef: '17084504',
  siriRideScheduledStartTime: new Date('2026-08-20T05:15:00Z'), // 08:15 Israel (IDT)
  recordedAtTime: new Date('2026-08-20T05:31:12Z'),
  lat: 32.068272,
  lon: 34.79298,
  ...fields,
})

const paramsOf = (href: string) =>
  Object.fromEntries(new URLSearchParams(href.slice(href.indexOf('?'))))

describe('buildSingleLineMapRideLink', () => {
  it('carries the ride and the ping it was clicked from, entirely in the query string', () => {
    const href = buildSingleLineMapRideLink(hit(), LINE)!

    expect(href.startsWith('/single-line-map?')).toBe(true)
    expect(paramsOf(href)).toEqual({
      date: '2026-08-20',
      operatorId: '3',
      lineNumber: '480',
      routeKey: '10480-1-#',
      rideTime: '08-15',
      // namespaced: the ping is a param of /single-line-map, not a global search key
      'single-line-map.focusPing': locationFixKey(hit()),
    })
  })

  it('files a past-midnight departure under the day it departs on, not the day browsed', () => {
    // 00:30 Israel on the 20th — the page reaches it while browsing the 19th.
    const href = buildSingleLineMapRideLink(
      hit({ siriRideScheduledStartTime: new Date('2026-08-19T21:30:00Z') }),
      LINE,
    )!

    expect(paramsOf(href)).toMatchObject({ date: '2026-08-20', rideTime: '00-30' })
  })

  // The persisted react-query cache round-trips hits through JSON, so a restored one
  // carries ISO strings where the client's types promise Dates.
  it('builds the same link from a cache-restored hit', () => {
    const restored = JSON.parse(JSON.stringify(hit())) as ReturnType<typeof hit>

    expect(buildSingleLineMapRideLink(restored, LINE)).toEqual(
      buildSingleLineMapRideLink(hit(), LINE),
    )
  })

  it('gives up on a ride with no scheduled departure', () => {
    expect(
      buildSingleLineMapRideLink(hit({ siriRideScheduledStartTime: undefined }), LINE),
    ).toBeUndefined()
  })
})
