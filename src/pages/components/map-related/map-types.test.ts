import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { uniqBy } from 'es-toolkit/compat'
import { findPositionByFixKey, locationFixKey, type PositionGroup, toPoint } from './map-types'

const location = (
  fields: Partial<SiriVehicleLocationWithRelatedPydanticModel>,
): SiriVehicleLocationWithRelatedPydanticModel => ({
  id: 1,
  siriRideVehicleRef: '7346652',
  recordedAtTime: new Date('2026-07-29T03:00:46Z'),
  lat: 32.068272,
  lon: 34.79298,
  ...fields,
})

describe('locationFixKey', () => {
  it('collapses the same fix re-emitted across snapshots under a new id', () => {
    // The live API returns these: identical vehicle, time and position, distinct row ids.
    const fixes = [location({ id: 1 }), location({ id: 2 }), location({ id: 3 })]
    expect(uniqBy(fixes, locationFixKey)).toHaveLength(1)
    // The id-keyed predicate this replaced could never collapse them.
    expect(uniqBy(fixes, (loc) => loc.id)).toHaveLength(3)
  })

  it('keeps rows that share a timestamp but disagree on position', () => {
    const fixes = [location({ id: 1 }), location({ id: 2, lat: 31.972254, lon: 34.753899 })]
    expect(uniqBy(fixes, locationFixKey)).toHaveLength(2)
  })

  it('keeps different vehicles reporting the same time and position', () => {
    const fixes = [location({ id: 1 }), location({ id: 2, siriRideVehicleRef: '23828801' })]
    expect(uniqBy(fixes, locationFixKey)).toHaveLength(2)
  })
})

describe('findPositionByFixKey', () => {
  const group = (
    locations: SiriVehicleLocationWithRelatedPydanticModel[],
    color: string,
  ): PositionGroup => ({ color, positions: locations.map(toPoint) })

  const first = location({ id: 1, recordedAtTime: new Date('2026-07-29T03:00:46Z') })
  const second = location({ id: 2, recordedAtTime: new Date('2026-07-29T03:01:46Z') })
  const otherVehicle = location({ id: 3, siriRideVehicleRef: '23828801' })
  const groups = [group([first, second], '#f97316'), group([otherVehicle], '#3b82f6')]

  it('locates a ping in a later group', () => {
    expect(findPositionByFixKey(groups, locationFixKey(otherVehicle))).toEqual({
      groupIndex: 1,
      positionIndex: 0,
      loc: [otherVehicle.lat, otherVehicle.lon],
    })
  })

  it('picks the right ping within a group', () => {
    expect(findPositionByFixKey(groups, locationFixKey(second))?.positionIndex).toBe(1)
  })

  it('matches the same fix carrying a different row id', () => {
    const reEmitted = location({ ...first, id: 999 })
    expect(findPositionByFixKey(groups, locationFixKey(reEmitted))?.positionIndex).toBe(0)
  })

  it('returns null when the ride does not hold that fix', () => {
    const elsewhere = location({ id: 4, lat: 31.252973, lon: 34.791462 })
    expect(findPositionByFixKey(groups, locationFixKey(elsewhere))).toBeNull()
    expect(findPositionByFixKey([], locationFixKey(first))).toBeNull()
  })
})
