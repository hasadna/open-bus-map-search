import { renderHook, waitFor } from '@testing-library/react'
import { SIRI_API } from 'src/api/apiConfig'
import useVehicleLocations from 'src/hooks/useVehicleLocations'

// Exercises the fix: a failed LocationObservable load must NOT be cached as a
// completed one. The failed entry is evicted from the module-level cache so a
// later request for the same range refetches instead of replaying empty data.
jest.mock('src/api/apiConfig', () => ({
  SIRI_API: { siriVehicleLocationsListGet: jest.fn() },
}))

// SIRI_API.siriVehicleLocationsListGet is a jest.fn() from the mock factory
// above, not a real bound method - unbound-method is a false positive here.
// eslint-disable-next-line @typescript-eslint/unbound-method
const apiMock = SIRI_API.siriVehicleLocationsListGet as jest.Mock

describe('useVehicleLocations - failed load is not cached as success', () => {
  beforeEach(() => {
    apiMock.mockReset()
  })

  it('refetches on a later request for the same range after a failed load', async () => {
    // Unique range so this test owns its cache key regardless of order.
    const base = 1_700_010_000_000
    const params = {
      from: base,
      to: base,
      lineRef: 101,
      operatorRef: 202,
      vehicleRef: 303,
      splitMinutes: false as const,
    }

    // First request fails on every attempt (3 internal retries -> throw).
    apiMock.mockRejectedValue(new Error('network down'))
    const first = renderHook(() => useVehicleLocations(params))
    await waitFor(() => expect(apiMock.mock.calls.length).toBeGreaterThanOrEqual(3), {
      timeout: 10000,
    })
    const callsAfterFailure = apiMock.mock.calls.length
    first.unmount()

    // A later request for the SAME range. If the failed observable were cached
    // (the bug), getLocations would replay it and never hit the API again.
    // With the fix it was evicted, so this must trigger a fresh fetch.
    apiMock.mockResolvedValue([])
    renderHook(() => useVehicleLocations(params))
    await waitFor(() => expect(apiMock.mock.calls.length).toBeGreaterThan(callsAfterFailure), {
      timeout: 10000,
    })
  }, 25000)
})
