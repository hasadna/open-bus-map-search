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

    // Select a route (triggers siri_rides/list for start time options)
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

    // Select start time to trigger siri vehicle locations fetch
    const startTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await startTimeDropdown.count()) > 0 && await startTimeDropdown.isEnabled()) {
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

    // Fill line 9999 to record the empty routes response.
    // Done after route selection so no active route/SIRI state is disrupted.
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('9999')
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    // Switch to vehicle-number search and record siri_rides/list for vehicle-based start times
    await page.getByRole('button', { name: 'לפי מספר רכב' }).click()
    const vehicleRidesPromise = page.waitForResponse((response) => {
      const url = response.url()
      return url.includes('/siri_rides/list') && url.includes('vehicle_refs=7489226')
    })
    await page.getByRole('textbox', { name: 'מספר רכב' }).fill('7489226')
    await vehicleRidesPromise
    await page.waitForLoadState('networkidle')

    const vehicleStartTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await vehicleStartTimeDropdown.count()) > 0 && await vehicleStartTimeDropdown.isEnabled()) {
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
