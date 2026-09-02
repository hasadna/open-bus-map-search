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

// Real fixes from siri_ride 139132705 (line 966, 2026-06-14): a Golan track, then a run
// spoofed onto Beirut airport, then a fix deep in Jordan that the bounds let through.
const GOLAN_A: [number, number] = [32.81034, 35.64572]
const GOLAN_B: [number, number] = [32.81603, 35.69295]
const BEIRUT: [number, number] = [33.81861, 35.49638]
const JORDAN: [number, number] = [31.71709, 35.99936]

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
    const { route } = buildRoutePolylines([at(GOLAN_B, 0), at(JORDAN, 240)])
    expect(route).toEqual([{ dashed: true, positions: [GOLAN_B, JORDAN] }])
  })

  it('dashes a pair whose movement no clock can confirm', () => {
    const { route } = buildRoutePolylines([{ loc: GOLAN_A, color: 0 }, at(GOLAN_B, 360)])
    expect(route).toEqual([{ dashed: true, positions: [GOLAN_A, GOLAN_B] }])
  })

  it('splits the route into runs so one bad pair does not dash all of it', () => {
    const { route } = buildRoutePolylines([
      at(GOLAN_A, 0),
      at(GOLAN_B, 360),
      at(JORDAN, 600),
      at([31.718, 36.0], 900),
    ])
    expect(route.map((path) => path.dashed)).toEqual([false, true, false])
    expect(route[0].positions).toEqual([GOLAN_A, GOLAN_B])
    expect(route[1].positions).toEqual([GOLAN_B, JORDAN])
  })

  it('leaves a fully spoofed ride with no route at all', () => {
    const { route, claimed } = buildRoutePolylines([at(BEIRUT, 0), at(BEIRUT, 60)])
    expect(route).toHaveLength(0)
    expect(claimed).toEqual([[BEIRUT, BEIRUT]])
  })
})
