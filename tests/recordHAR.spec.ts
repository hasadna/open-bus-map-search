/**
 * HAR Recording Script
 *
 * Run this to update HAR fixtures when API responses change:
 *   cd .trees/block-network
 *   RECORD_HAR=1 npx playwright test tests/recordHAR.spec.ts --workers=1
 *
 * After running, commit the updated HAR files in tests/HAR/.
 */
import { Page, test } from '@playwright/test'
import { getPastDate } from './utils'

test.describe.configure({ mode: 'serial' })

async function setupRecording(page: Page, harFile: string) {
  await page.clock.setSystemTime(getPastDate())
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  await page.route(/api\.github\.com/, (route) => route.abort())
  await page.route(/open-bus-backend\.k8s\.hasadna\.org\.il/, (route) => route.abort())
  await page.route(/.*openstreetmap*/, (route) => route.abort())
  // NOTE: stride-api is NOT aborted here, so real responses are recorded into the HAR
  await page.routeFromHAR(harFile, {
    url: /stride-api/,
    update: true,
    updateContent: 'embed',
    updateMode: 'full',
  })
}

async function goToPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
}

async function openDropdownAndWait(page: Page, selector: string) {
  await page.locator(selector).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Record HAR files', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  // ---- timeline.har -------------------------------------------------------
  // Single test records ALL needed entries in one browser context
  test('record timeline.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/timeline.har')
    await goToPage(page, '/')
    await goToPage(page, '/timeline')

    // Trigger agencies list by opening operator dropdown
    await openDropdownAndWait(page, '#operator-select')

    // Select אגד and fill line 1 (triggers routes list)
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await page.getByPlaceholder('לדוגמה: 17א').fill('1')
    await page.waitForLoadState('networkidle')

    // Select route used for timeline hits test
    await openDropdownAndWait(page, '#route-select')
    const routeWithHits = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
    const hitsRouteExists = await page.getByRole('option', { name: routeWithHits }).count()
    if (hitsRouteExists > 0) {
      await page.getByRole('option', { name: routeWithHits, exact: true }).click()
      await page.waitForLoadState('networkidle')
      await openDropdownAndWait(page, '#stop-select')
      const stopOption = page.getByRole('option', { name: 'חיים הרצוג/שדרות מנחם בגין (גדרה)' })
      if ((await stopOption.count()) > 0) {
        await stopOption.click()
        await page.locator('.MuiCircularProgress-svg').waitFor({ state: 'hidden' })
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    } else {
      await page.keyboard.press('Escape')
    }

    // Also test אגד operator without clearing (so duplication test passes)

    // Test empty routes: switch to דן בדרום + line 9999
    // First clear the operator by navigating away and back
    await page.goto('/timeline')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await openDropdownAndWait(page, '#operator-select')
    const danBaDarom = page.getByRole('option', { name: 'דן בדרום', exact: true })
    if ((await danBaDarom.count()) > 0) {
      await danBaDarom.click()
      await page.getByPlaceholder('לדוגמה: 17א').fill('9999')
      await page.waitForLoadState('networkidle')
      await page.getByText('הקו לא נמצא').waitFor({ state: 'visible' })
    } else {
      await page.keyboard.press('Escape')
    }
  })

  // ---- operator.har -------------------------------------------------------
  // Single test records ALL needed entries in one browser context
  test('record operator.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/operator.har')
    await goToPage(page, '/')
    await goToPage(page, '/operator')

    // Open operator dropdown (triggers gtfs_agencies/list)
    await page.getByRole('button', { name: 'פתח' }).click()
    await page.waitForLoadState('networkidle')

    // Select אגד (triggers group_by × 2 + gtfs_routes/list)
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await page.waitForLoadState('networkidle')
  })

  // ---- singleline.har -----------------------------------------------------
  // Single test records ALL needed entries in one browser context
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

    // Select start time to trigger siri data fetch (including siri_vehicle_locations/list)
    const startTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await startTimeDropdown.count()) > 0) {
      await startTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstTime = page.getByRole('option').first()
      if ((await firstTime.count()) > 0) {
        // Register before click to avoid missing the response
        const lineLocationsPromise = page.waitForResponse(
          (response) => response.url().includes('/siri_vehicle_locations/list'),
          { timeout: 30000 },
        )
        await firstTime.click()
        await lineLocationsPromise
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // Click a bus marker to record BusToolTip's gtfs_routes/list?line_refs=... call.
    // networkidle waits for all in-flight requests (including BusToolTip's fetch) to complete
    // before pressing Escape, ensuring the response body is captured in the HAR.
    const busMarkers = page.locator('.leaflet-marker-pane > img[src$="marker-dot.png"]')
    if ((await busMarkers.count()) > 2) {
      await busMarkers.nth(2).click({ force: true })
      await page.waitForLoadState('networkidle')
      await page.keyboard.press('Escape')
    }

    // Fill line 9999 to record the empty routes response
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('9999')
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    // Switch to vehicle-number search and record the requests for vehicle-based start times
    await page.getByRole('button', { name: 'לפי מספר רכב' }).click()
    const vehicleRidesPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/siri_rides/list') &&
        response.url().includes('vehicle_refs=7489226'),
    )
    await page.getByRole('textbox', { name: 'מספר רכב' }).fill('7489226')
    await vehicleRidesPromise
    await page.waitForLoadState('networkidle')

    const vehicleStartTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await vehicleStartTimeDropdown.count()) > 0) {
      await vehicleStartTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const vehicleStartTime = page.getByRole('option', { name: /04:30/ }).first()
      if ((await vehicleStartTime.count()) > 0) {
        // Force full body download for both deferred side-effect requests triggered
        // by selecting 04:30: siri_vehicle_locations (useEffect on rideIds) and
        // gtfs_routes?line_refs= (React Query stopsQuery using parsedStartTime.lineRef).
        // waitForResponse alone resolves at headers — .body() blocks until full body arrives.
        const vehicleLocationsBody = page
          .waitForResponse((r) => r.url().includes('/siri_vehicle_locations/list'))
          .then((r) => r.body())
        const gtfsRoutesByLineRefBody = page
          .waitForResponse(
            (r) => r.url().includes('/gtfs_routes/list') && r.url().includes('line_refs='),
          )
          .then((r) => r.body())
        await vehicleStartTime.click()
        await Promise.all([vehicleLocationsBody, gtfsRoutesByLineRefBody])
      } else {
        await page.keyboard.press('Escape')
      }
    }
  })

  // ---- missing.har --------------------------------------------------------
  // Single test records ALL needed entries for the gaps page
  test('record missing.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/missing.har')
    await goToPage(page, '/')
    await goToPage(page, '/gaps')

    await page.getByLabel('חברה מפעילה').click()
    await page.waitForLoadState('networkidle')

    const operator = page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true })
    if ((await operator.count()) > 0) {
      await operator.click()
    } else {
      await page.keyboard.press('Escape')
      return
    }

    await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
    await page.waitForLoadState('networkidle')

    await page.getByLabel(/בחירת מסלול נסיעה/).click()
    await page.waitForLoadState('networkidle')

    const route =
      'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
    const routeOption = page.getByRole('option', { name: route })
    if ((await routeOption.count()) > 0) {
      const waitForGaps = page.waitForResponse((response) =>
        response.url().includes('/rides_execution/list'),
      )
      await routeOption.click()
      await waitForGaps
      await page.waitForLoadState('networkidle')
    } else {
      await page.keyboard.press('Escape')
    }
  })

  // ---- clearbutton.har ----------------------------------------------------
  // Single test records ALL needed entries in one browser context
  test('record clearbutton.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/clearbutton.har')
    await goToPage(page, '/')
    await goToPage(page, '/timeline')

    // Trigger agencies list
    await openDropdownAndWait(page, '#operator-select')

    // Select אלקטרה אפיקים and fill line 64
    const elktraOption = page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true })
    if ((await elktraOption.count()) > 0) {
      await elktraOption.click()
      await page.getByPlaceholder('לדוגמה: 17א').fill('64')
      await page.waitForLoadState('networkidle')
      // Open route dropdown to ensure routes are fetched
      await openDropdownAndWait(page, '#route-select')
      await page.keyboard.press('Escape')
    } else {
      await page.keyboard.press('Escape')
    }
  })
})
