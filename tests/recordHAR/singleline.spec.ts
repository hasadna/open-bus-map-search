import { test } from '@playwright/test'
import { goToPage, setupRecording } from './utils'

test.describe('Record singleline.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  test('record singleline.har', async ({ page }) => {
    test.setTimeout(300_000)
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

    // Select a route. Wait for the loading spinner to disappear — it only clears once
    // ALL split chunks and any paginated follow-up requests have finished loading.
    const routeDropdown = page.getByLabel(/בחירת מסלול נסיעה/)
    if ((await routeDropdown.count()) > 0) {
      await routeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstRoute = page.getByRole('option').first()
      if ((await firstRoute.count()) > 0) {
        // Register before clicking so the first chunk response anchors us past the
        // race: by the time it resolves, locationsAreLoading is true and the spinner
        // is guaranteed visible. Then wait for spinner hidden — that only fires after
        // ALL split chunks AND any paginated follow-up requests complete.
        const firstChunkPromise = page.waitForResponse(
          (r) =>
            r.url().includes('/siri_vehicle_locations/list') &&
            !r.url().includes('siri_ride__vehicle_ref'),
          { timeout: 30_000 },
        )
        await firstRoute.click()
        await firstChunkPromise
        const spinner = page.locator(
          '[aria-label="שעות נוספות בטעינה. ניתן להשתמש בשעות הזמינות כבר עכשיו"]',
        )
        await spinner.waitFor({ state: 'hidden', timeout: 60_000 })
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // Select a start time to filter positions and show markers on the map.
    // Selecting a start time is purely client-side (no network request fires).
    // The only network event that follows is gtfs_routes/list?limit=1 when a
    // marker is clicked and BusToolTip mounts — captured via .bus-tooltip .content.
    const startTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await startTimeDropdown.count()) > 0 && (await startTimeDropdown.isEnabled())) {
      await startTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstTime = page.getByRole('option').first()
      if ((await firstTime.count()) > 0) {
        await firstTime.click()
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

    // Switch to vehicle-number search and record vehicle-based start times.
    // Same anchor pattern: waitForResponse before fill, then spinner hidden to
    // cover all split chunks and any paginated follow-up requests.
    await page.getByRole('button', { name: 'לפי מספר רכב' }).click()
    const firstVehicleChunkPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/siri_vehicle_locations/list') &&
        r.url().includes('siri_ride__vehicle_ref=7489226'),
    )
    await page.getByRole('textbox', { name: 'מספר רכב' }).fill('7489226')
    await firstVehicleChunkPromise
    const vehicleSpinner = page.locator(
      '[aria-label="שעות נוספות בטעינה. ניתן להשתמש בשעות הזמינות כבר עכשיו"]',
    )
    await vehicleSpinner.waitFor({ state: 'hidden', timeout: 60_000 })
    await page.waitForLoadState('networkidle')

    const vehicleStartTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if (
      (await vehicleStartTimeDropdown.count()) > 0 &&
      (await vehicleStartTimeDropdown.isEnabled())
    ) {
      await vehicleStartTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const vehicleStartTime = page.getByRole('option', { name: /04:30/ }).first()
      if ((await vehicleStartTime.count()) > 0) {
        await vehicleStartTime.click()
        // Wait for React to re-render filteredPositions and fire the fetchOptions effect,
        // which triggers getRoutesByLineRef requests for each option label.
        await page.waitForTimeout(1000)
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }
  })
})
