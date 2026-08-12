import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { uniqBy } from 'es-toolkit/compat'
import { locationFixKey } from './map-types'

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
