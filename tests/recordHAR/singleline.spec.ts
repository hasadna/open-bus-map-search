import { test } from '@playwright/test'
import { goToPage, setupRecording } from './utils'

test.describe('Record singleline.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  test('record singleline.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/singleline.har')
    await goToPage(page, '/')
    await goToPage(page, '/single-line-map')

    // Open operator dropdown (triggers gtfs_agencies/list)
    await page.getByLabel('חברה מפעילה').click()
    await page.waitForLoadState('networkidle')

    // Select אודליה מוניות בעמ (operator_ref=97)
    const operator = page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true })
    if ((await operator.count()) > 0) {
      await operator.click()
    } else {
      await page.keyboard.press('Escape')
    }

    // Fill line 16 (triggers gtfs_routes/list with route_short_name=16)
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
    await page.waitForLoadState('networkidle')

    // Fill line 9999 BEFORE route selection to record the empty routes response.
    // Done here so no route or SIRI state is active, preventing transient aborted
    // requests (ghost HAR entries) that would otherwise appear when cleaning up.
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('9999')
    await page.waitForTimeout(1000)
    await page.waitForLoadState('networkidle')

    // Re-fill line 16 to proceed with route selection
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
    await page.waitForLoadState('networkidle')

    // Select a route (triggers gtfs_rides/list, gtfs_ride_stops/list, gtfs_stops/get, siri data)
    const routeDropdown = page.getByLabel(/בחירת מסלול נסיעה/)
    if ((await routeDropdown.count()) > 0) {
      await routeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstRoute = page.getByRole('option').first()
      if ((await firstRoute.count()) > 0) {
        await firstRoute.click()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // Select start time to trigger siri data fetch
    const startTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await startTimeDropdown.count()) > 0) {
      await startTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstTime = page.getByRole('option').first()
      if ((await firstTime.count()) > 0) {
        await firstTime.click()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // Switch to vehicle-number search and record the requests for vehicle-based start times
    await page.getByRole('button', { name: 'לפי מספר רכב' }).click()
    const vehicleRequestsPromise = page.waitForResponse((response) => {
      const url = response.url()
      return (
        url.includes('/siri_vehicle_locations/list') &&
        url.includes('siri_ride__vehicle_ref=7489226') &&
        url.includes('recorded_at_time_from=2024-02-12T04%3A00%3A00.000Z')
      )
    })
    await page.getByRole('textbox', { name: 'מספר רכב' }).fill('7489226')
    await vehicleRequestsPromise
    await page.waitForLoadState('networkidle')

    const vehicleStartTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await vehicleStartTimeDropdown.count()) > 0) {
      await vehicleStartTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const vehicleStartTime = page.getByRole('option', { name: /04:30/ }).first()
      if ((await vehicleStartTime.count()) > 0) {
        await vehicleStartTime.click()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }
  })
})
