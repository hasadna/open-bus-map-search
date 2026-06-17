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
  test('resolves operator, line, origin/destination and times for the vehicle rides', async ({
    page,
  }) => {
    await setupTest(page)
    await mockVehicleApi(page)
    await gotoSeededVehiclePage(page)

    // line 16 ride: every field resolved from the GTFS route, not from the (null) ride fields
    const line16 = rideRow(page, '04:30')
    await expect(line16).toBeVisible()
    await expect(line16).toContainText('אגד')
    await expect(line16).toContainText('16')
    await expect(line16).toContainText('תל אביב')
    await expect(line16).toContainText('ירושלים')

    // post-midnight ride: real wall-clock time + moon, not the extended-hour token
    const moonRow = rideRow(page, '🌙 00:30')
    await expect(moonRow).toBeVisible()
    await expect(moonRow).toContainText('17')
    await expect(page.getByText('24:30')).toHaveCount(0)
  })

  test('renders dashes and no link for a ride whose line ref has no GTFS route', async ({
    page,
  }) => {
    await setupTest(page)
    await mockVehicleApi(page)
    await gotoSeededVehiclePage(page)

    const unresolved = rideRow(page, '08:00')
    await expect(unresolved).toBeVisible()
    // line / origin / destination all fall back to the em-dash placeholder
    await expect(unresolved.getByText('—')).toHaveCount(3)
    // an unresolvable ride is not clickable
    await expect(unresolved.getByRole('link')).toHaveCount(0)
  })

  test('a resolvable ride links to single-line-map carrying its route identity', async ({
    page,
  }) => {
    await setupTest(page)
    await mockVehicleApi(page)
    await gotoSeededVehiclePage(page)

    const link = rideRow(page, '04:30').getByRole('link')
    const href = await link.getAttribute('href')
    const url = new URL(href!, 'http://localhost:3000')
    expect(url.pathname).toBe('/single-line-map')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      date: '2024-02-12',
      operatorId: '97',
      lineNumber: '16',
      routeKey: '52016-1-#',
      rideTime: '04-30',
    })

    // and it actually navigates there
    await link.click()
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
