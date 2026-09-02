import { Point } from 'src/pages/components/map-related/map-types'
import {
  classifyMovement,
  impliedSpeedKmh,
  isNoFixLocation,
  isPlausibleLocation,
  partitionByPlausibility,
} from './gpsIntegrity'

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

describe('isPlausibleLocation', () => {
  it('accepts fixes inside Israel', () => {
    expect(isPlausibleLocation(GOLAN_A)).toBe(true)
  })

  it('rejects the Beirut-airport spoofing target', () => {
    expect(isPlausibleLocation(BEIRUT)).toBe(false)
  })

  it('lets a spoof that lands inside the bounds through — Jordan is not excluded by geography', () => {
    expect(isPlausibleLocation(JORDAN)).toBe(true)
  })

  it('rejects the no-fix sentinel', () => {
    expect(isPlausibleLocation([-1, -1])).toBe(false)
    expect(isNoFixLocation([-1, -1])).toBe(true)
    expect(isNoFixLocation(GOLAN_A)).toBe(false)
  })
})

describe('impliedSpeedKmh', () => {
  it('measures ground speed between two fixes', () => {
    // ~4.4 km apart, six minutes → about 44 km/h
    const speed = impliedSpeedKmh(at(GOLAN_A, 0), at(GOLAN_B, 360))
    expect(speed).toBeGreaterThan(35)
    expect(speed).toBeLessThan(55)
  })

  it('is undefined when the fixes cannot be ordered', () => {
    expect(impliedSpeedKmh(at(GOLAN_A, 60), at(GOLAN_B, 0))).toBeUndefined()
    expect(impliedSpeedKmh({ loc: GOLAN_A, color: 0 }, at(GOLAN_B, 60))).toBeUndefined()
  })

  it('calls two different positions at one instant unusable, but not two identical ones', () => {
    expect(impliedSpeedKmh(at(GOLAN_A, 60), at(GOLAN_B, 60))).toBe(Infinity)
    expect(impliedSpeedKmh(at(GOLAN_A, 60), at(GOLAN_A, 60))).toBe(0)
  })
})

describe('classifyMovement', () => {
  it('accepts ordinary bus movement', () => {
    expect(classifyMovement(at(GOLAN_A, 0), at(GOLAN_B, 360))).toBe('plausible')
  })

  it('accepts train speeds rather than calling real motion impossible', () => {
    // 12 km in 5 minutes is 144 km/h — fast, and well inside what a train does
    expect(classifyMovement(at([32.0, 34.8], 0), at([32.108, 34.8], 300))).toBe('plausible')
  })

  it('rejects a jump no vehicle could drive', () => {
    // Golan → Jordan, 125 km in 4 minutes, both ends inside the bounds
    expect(classifyMovement(at(GOLAN_B, 0), at(JORDAN, 240))).toBe('impossible')
  })

  it('reports an unclocked pair as unverifiable rather than folding it in with plausible', () => {
    expect(classifyMovement({ loc: GOLAN_A, color: 0 }, at(GOLAN_B, 60))).toBe('unverifiable')
    expect(classifyMovement(at(GOLAN_A, 60), at(GOLAN_B, 0))).toBe('unverifiable')
  })
})

describe('partitionByPlausibility', () => {
  it('splits fixes by whether the vehicle could hold the position, keeping order', () => {
    const { plausible, implausible } = partitionByPlausibility([
      at(GOLAN_A, 0),
      at(BEIRUT, 300),
      at(GOLAN_B, 600),
    ])
    expect(plausible.map((p) => p.loc)).toEqual([GOLAN_A, GOLAN_B])
    expect(implausible.map((p) => p.loc)).toEqual([BEIRUT])
  })
})
