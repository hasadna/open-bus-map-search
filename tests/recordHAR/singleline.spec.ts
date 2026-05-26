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

    // Select a route. Explicitly await siri_rides/list body so React has re-rendered
    // the start-time dropdown as enabled before we check isEnabled() below.
    const routeDropdown = page.getByLabel(/בחירת מסלול נסיעה/)
    if ((await routeDropdown.count()) > 0) {
      await routeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstRoute = page.getByRole('option').first()
      if ((await firstRoute.count()) > 0) {
        const ridesPromise = page.waitForResponse(
          (r) => r.url().includes('/siri_rides/list') && !r.url().includes('vehicle_refs'),
          { timeout: 30_000 },
        )
        await firstRoute.click()
        const ridesResponse = await ridesPromise
        await ridesResponse.body()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // Select start time to trigger siri vehicle locations fetch.
    const startTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await startTimeDropdown.count()) > 0 && await startTimeDropdown.isEnabled()) {
      await startTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstTime = page.getByRole('option').first()
      if ((await firstTime.count()) > 0) {
        // Register before clicking so the response is captured even if networkidle fires first.
        const vehicleLocationsPromise = page.waitForResponse(
          (r) => r.url().includes('/siri_vehicle_locations/list'),
          { timeout: 60_000 },
        )
        await firstTime.click()
        const locationsResponse = await vehicleLocationsPromise
        await locationsResponse.body()
        await page.waitForLoadState('networkidle')

        // Click a bus marker to open its Leaflet popup. BusToolTip only mounts after
        // the popup opens (_contentNode becomes non-null), which triggers gtfs_routes/list?limit=1.
        // Wait for .bus-tooltip .content rather than waitForResponse: the DOM element
        // only appears after React processes the API response, guaranteeing the HAR
        // recorder has the full response before we proceed.
        const clicked = await page.evaluate(() => {
          const icons = document.querySelectorAll('.leaflet-marker-pane .my-div-icon')
          const el = Array.from(icons).find((el) => {
            const r = el.getBoundingClientRect()
            return (
              r.x >= 0 &&
              r.y >= 0 &&
              r.x + r.width <= window.innerWidth &&
              r.y + r.height <= window.innerHeight
            )
          })
          if (!el) return false
          ;(el as HTMLElement).click()
          return true
        })
        if (clicked) {
          await page.waitForFunction(
            () => document.querySelector('.bus-tooltip .content') !== null,
            { timeout: 120_000 },
          )
          await page.waitForLoadState('networkidle')
        }
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
    const vehicleRidesResponse = await vehicleRidesPromise
    await vehicleRidesResponse.body()
    await page.waitForLoadState('networkidle')

    const vehicleStartTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await vehicleStartTimeDropdown.count()) > 0 && await vehicleStartTimeDropdown.isEnabled()) {
      await vehicleStartTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const vehicleStartTime = page.getByRole('option', { name: /04:30/ }).first()
      if ((await vehicleStartTime.count()) > 0) {
        const vehicleLocationsPromise = page.waitForResponse(
          (r) => r.url().includes('/siri_vehicle_locations/list'),
          { timeout: 60_000 },
        )
        await vehicleStartTime.click()
        const vehicleLocationsResponse = await vehicleLocationsPromise
        await vehicleLocationsResponse.body()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }
  })
})
