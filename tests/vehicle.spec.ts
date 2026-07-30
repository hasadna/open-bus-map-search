import i18next from 'i18next'
import { israelServiceTime } from './fixtures/date'
import { strideDefaults } from './fixtures/defaults'
import { siriRide, siriRidesWire } from './fixtures/siri'
import { errorStub, okStub, routeStride, unrouteStride } from './fixtures/stride'
import { expect, setupTest, test } from './utils'
import { mockVehicleApi, VEHICLE_NUMBER, vehicleUrls } from './vehicleMocks'

// Land directly on /vehicle with the number in the URL: a full navigation makes
// MainRoute capture it into InitialUrlParamsContext, which is how the page seeds
// its number (the same path the map legend's deep-link relies on).
const gotoSeededVehiclePage = async (page: Parameters<typeof setupTest>[0]) => {
  await page.goto(`/vehicle?vehicleNumber=${VEHICLE_NUMBER}`)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
}

const rideRow = (page: Parameters<typeof setupTest>[0], text: string) =>
  page.getByRole('row').filter({ hasText: text })

test.describe('Vehicle page', () => {
  // Two layers, both installed for every test: the app-wide defaults, then the /vehicle
  // scenario. A test that is ABOUT one of these URLs adds a third layer of its own below.
  test.beforeEach(async ({ page }) => {
    await setupTest(page, 'he', strideDefaults())
    await mockVehicleApi(page)
  })

  // The per-field resolution (operator/line/origin/destination, moon prefix, no-route
  // dashes, exact link payload) is exhaustively covered in buildVehicleRideRows.test.ts.
  // This smoke only verifies the page wires that transform up: it renders the seeded
  // vehicle's rides and a resolvable ride navigates to single-line-map.
  test('renders the seeded vehicle rides and links a resolvable ride to single-line-map', async ({
    page,
  }) => {
    await gotoSeededVehiclePage(page)

    await expect(rideRow(page, '04:30')).toBeVisible()
    await expect(
      page.getByRole('table', { name: i18next.t('vehicle_page_title') }).locator('tbody tr'),
    ).toHaveCount(3) // all three mocked rides rendered

    await rideRow(page, '04:30').getByRole('link').click()
    await page.waitForURL((u) => u.pathname === '/single-line-map')
  })

  test('typing a vehicle number in the selector loads that vehicle rides', async ({ page }) => {
    // arrive without a seeded number (SPA nav, so InitialUrlParams stays empty)
    await page.goto('/vehicle')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await expect(page.getByRole('row')).toHaveCount(0)

    await page.getByRole('textbox', { name: i18next.t('choose_vehicle') }).fill(VEHICLE_NUMBER)

    await expect(rideRow(page, '04:30')).toBeVisible()
    await expect(rideRow(page, '04:30')).toContainText('16')
  })

  // Overriding ONE url keeps every other stub: the single ride still resolves its line name
  // from the scenario's operator-97 GTFS routes, which only the beforeEach registered. This is
  // the cheap way to test a narrow case — one designed ride instead of a whole scenario.
  test('a test can narrow one endpoint and still use the rest of the scenario', async ({
    page,
  }) => {
    const oneRide = siriRide({
      id: 62029001,
      vehicleRef: VEHICLE_NUMBER,
      siriRouteLineRef: 28099,
      siriRouteOperatorRef: 97,
      scheduledStartTime: israelServiceTime(4, 30),
    })
    await routeStride(page, [okStub(vehicleUrls.rides, siriRidesWire([oneRide]))])
    unrouteStride(page, [vehicleUrls.gtfsRoutes(3)]) // no operator-3 ride left to resolve
    await gotoSeededVehiclePage(page)

    await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(1)
    await expect(rideRow(page, '04:30')).toContainText('16')
  })

  test('shows a not-found message when the vehicle has no rides', async ({ page }) => {
    await routeStride(page, [okStub(vehicleUrls.rides, siriRidesWire([]))])
    // No rides means no operator to resolve, so dropping the scenario's GTFS stubs turns a
    // route lookup into an unmocked-request failure instead of a silently served response.
    unrouteStride(page, [vehicleUrls.gtfsRoutes(97), vehicleUrls.gtfsRoutes(3)])
    await gotoSeededVehiclePage(page)

    await expect(page.getByText(i18next.t('vehicle_no_rides'))).toBeVisible()
    await expect(page.getByRole('table')).toHaveCount(0)
  })

  test('shows an error message when the rides request fails', async ({ page }) => {
    await routeStride(page, [errorStub(vehicleUrls.rides, 500)])
    // A failed rides request yields no operator to resolve, so dropping the scenario's GTFS
    // stubs asserts the page does not look routes up anyway — and keeps the two it would
    // otherwise leave unrequested from tripping the unclaimed-stub check.
    unrouteStride(page, [vehicleUrls.gtfsRoutes(97), vehicleUrls.gtfsRoutes(3)])
    await gotoSeededVehiclePage(page)

    // react-query retries the failed request with backoff before surfacing isError
    await expect(page.getByText(i18next.t('vehicle_load_error'))).toBeVisible({ timeout: 20000 })
  })
})
