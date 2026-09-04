import type { Point } from './map-types'
import { buildRoutePolylines } from './routePolylines'

// Offset off the epoch: `toPoint` defaults a missing recordedAtTime to 0, so 0 means
// "untimed" throughout the app and a fixture sitting on it would test the wrong branch.
const RIDE_START = Date.UTC(2026, 5, 14, 16, 41)

const at = (loc: [number, number], seconds: number): Point => ({
  loc,
  color: 0,
  recordedAtTime: RIDE_START + seconds * 1000,
})

// Real fixes from siri_ride 139132705 (line 966, 2026-06-14): a Golan track and a run spoofed
// onto Beirut airport. EILAT is in bounds and 400 km away — a cluster no ride could drive to.
const GOLAN_A: [number, number] = [32.81034, 35.64572]
const GOLAN_B: [number, number] = [32.81603, 35.69295]
const BEIRUT: [number, number] = [33.81861, 35.49638]
const EILAT: [number, number] = [29.5581, 34.9482]

describe('buildRoutePolylines', () => {
  it('draws a clean ride as one solid path and claims nothing', () => {
    const { route, claimed } = buildRoutePolylines([at(GOLAN_A, 0), at(GOLAN_B, 360)])
    expect(route).toEqual([{ dashed: false, positions: [GOLAN_A, GOLAN_B] }])
    expect(claimed).toHaveLength(0)
  })

  it('short-circuits the route over a spoofed run and keeps it as a claimed path', () => {
    const { route, claimed } = buildRoutePolylines([
      at(GOLAN_A, 0),
      at(BEIRUT, 300),
      at(BEIRUT, 600),
      at(GOLAN_B, 900),
    ])
    // one bridge, drawn solid: the dotted claimed path is what shows the excursion
    expect(route).toEqual([{ dashed: false, positions: [GOLAN_A, GOLAN_B] }])
    expect(claimed).toEqual([[GOLAN_A, BEIRUT, BEIRUT, GOLAN_B]])
  })

  it('anchors a claimed path only on the side that has a real fix', () => {
    expect(buildRoutePolylines([at(BEIRUT, 0), at(GOLAN_A, 300)]).claimed).toEqual([
      [BEIRUT, GOLAN_A],
    ])
    expect(buildRoutePolylines([at(GOLAN_A, 0), at(BEIRUT, 300)]).claimed).toEqual([
      [GOLAN_A, BEIRUT],
    ])
  })

  it('dashes a jump no vehicle could drive, without dropping either end', () => {
    const { route } = buildRoutePolylines([at(GOLAN_B, 0), at(EILAT, 240)])
    expect(route).toEqual([{ dashed: true, positions: [GOLAN_B, EILAT] }])
  })

  it('dashes a pair whose movement no clock can confirm', () => {
    const { route } = buildRoutePolylines([{ loc: GOLAN_A, color: 0 }, at(GOLAN_B, 360)])
    expect(route).toEqual([{ dashed: true, positions: [GOLAN_A, GOLAN_B] }])
  })

  it('returns to solid after an unclocked pair, which does not break the ride apart', () => {
    const { route } = buildRoutePolylines([
      at(GOLAN_A, 0),
      at(GOLAN_B, 360),
      { loc: [32.82, 35.7], color: 0 },
      at([32.83, 35.71], 800),
      at([32.84, 35.72], 900),
    ])
    expect(route.map((path) => path.dashed)).toEqual([false, true, false])
  })

  it('keeps the ride solid when the junk is on both sides of it', () => {
    const { route } = buildRoutePolylines([
      at(EILAT, 0),
      at(EILAT, 60),
      at(GOLAN_A, 1000),
      at(GOLAN_B, 1400),
      at([32.82, 35.7], 1700),
      at(EILAT, 2000),
      at(EILAT, 2100),
    ])
    expect(route.map((path) => path.dashed)).toEqual([true, false, true])
  })

  it('leaves a fully spoofed ride with no route at all', () => {
    const { route, claimed } = buildRoutePolylines([at(BEIRUT, 0), at(BEIRUT, 60)])
    expect(route).toHaveLength(0)
    expect(claimed).toEqual([[BEIRUT, BEIRUT]])
  })
})

describe('an in-bounds cluster beyond an impossible jump', () => {
  // The backstop for a spoofing target the bounds do not catch: the fixes look ordinary among
  // themselves, but nothing except the report says the vehicle was ever there.
  const golan = [at(GOLAN_A, 0), at(GOLAN_B, 360), at([32.82, 35.7], 700)]
  const stranded = [at(EILAT, 1900), at([29.5582, 34.9483], 2000), at(EILAT, 2100)]

  it('is dashed throughout, not just on the jump that reaches it', () => {
    const { route } = buildRoutePolylines([...golan, ...stranded])
    expect(route.map((path) => path.dashed)).toEqual([false, true])
    // everything from the last real fix onwards is one dashed run
    expect(route[1].positions[0]).toEqual([32.82, 35.7])
    expect(route[1].positions.at(-1)).toEqual(EILAT)
  })

  it('is left out of the ride body, so the bookends stay on the route', () => {
    expect(buildRoutePolylines([...golan, ...stranded]).body).toEqual(golan)
  })
})
