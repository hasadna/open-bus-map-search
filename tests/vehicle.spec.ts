import i18next from 'i18next'
import { expect, setupTest, test } from './utils'
import { mockVehicleApi, VEHICLE_NUMBER } from './vehicleMocks'

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
  // The per-field resolution (operator/line/origin/destination, moon prefix, no-route
  // dashes, exact link payload) is exhaustively covered in buildVehicleRideRows.test.ts.
  // This smoke only verifies the page wires that transform up: it renders the seeded
  // vehicle's rides and a resolvable ride navigates to single-line-map.
  test('renders the seeded vehicle rides and links a resolvable ride to single-line-map', async ({
    page,
  }) => {
    await setupTest(page)
    await mockVehicleApi(page)
    await gotoSeededVehiclePage(page)

    await expect(rideRow(page, '04:30')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(3) // all three mocked rides rendered

    await rideRow(page, '04:30').getByRole('link').click()
    await page.waitForURL((u) => u.pathname === '/single-line-map')
  })

  test('typing a vehicle number in the selector loads that vehicle rides', async ({ page }) => {
    await setupTest(page)
    await mockVehicleApi(page)
    // arrive without a seeded number (SPA nav, so InitialUrlParams stays empty)
    await page.goto('/vehicle')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await expect(page.getByRole('row')).toHaveCount(0)

    await page.getByRole('textbox', { name: i18next.t('choose_vehicle') }).fill(VEHICLE_NUMBER)

    await expect(rideRow(page, '04:30')).toBeVisible()
    await expect(rideRow(page, '04:30')).toContainText('16')
  })

  test('shows a not-found message when the vehicle has no rides', async ({ page }) => {
    await setupTest(page)
    await mockVehicleApi(page, { rides: [] })
    await gotoSeededVehiclePage(page)

    await expect(page.getByText(i18next.t('vehicle_no_rides'))).toBeVisible()
    await expect(page.getByRole('table')).toHaveCount(0)
  })

  test('shows an error message when the rides request fails', async ({ page }) => {
    await setupTest(page)
    await mockVehicleApi(page, { ridesStatus: 500 })
    await gotoSeededVehiclePage(page)

    // react-query retries the failed request with backoff before surfacing isError
    await expect(page.getByText(i18next.t('vehicle_load_error'))).toBeVisible({ timeout: 20000 })
  })
})
