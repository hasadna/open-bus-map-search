/**
 * HAR Recording Script
 *
 * Run this to update HAR fixtures when API responses change:
 *   cd .trees/block-network
 *   RECORD_HAR=1 npx playwright test tests/recordHAR.spec.ts --workers=1
 *
 * After running, commit the updated HAR files in tests/HAR/.
 *
 * NOTE: realtimemap.har self-records from its own spec, not here:
 *   RECORD_HAR=1 npx playwright test tests/realtimemap.spec.ts --workers=1
 */
import { Page, test } from '@playwright/test'
import { getPastDate, trackResponseBodies } from './utils'

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
    const settleResponseBodies = trackResponseBodies(page)
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

    // Drain the planned-stops chain (gtfs_routes?line_refs -> gtfs_rides?limit=1 ->
    // gtfs_ride_stops -> gtfs_stops) so its tail isn't aborted at teardown and
    // recorded as a status:-1 empty entry. Then capture all bodies.
    await page.waitForLoadState('networkidle')
    await settleResponseBodies()
  })

  // ---- lineprofile.har ----------------------------------------------------
  // Records the queries fired by navigating directly to /profile/{id}:
  //   * gtfs_routes/get?id=... (loader)
  //   * gtfs_routes/list?route_short_name=... (useSingleLineData routes for line)
  //   * siri_rides/list?... (start-time options)
  // Route id 4339841 is the operator 97 / line 16 route for 2024-02-12 used by the
  // single-line tests; it is stable for the frozen test date.
  test('record lineprofile.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/lineprofile.har')
    const settleResponseBodies = trackResponseBodies(page)
    await goToPage(page, '/')
    await goToPage(page, '/profile/4339841')
    // Wait for the SIRI rides response so start-time options are populated in the HAR.
    await page
      .waitForResponse((r) => r.url().includes('/siri_rides/list'), { timeout: 30000 })
      .catch(() => undefined)
    await page.waitForLoadState('networkidle')

    // Ensure every stride-api response body is fully captured in the HAR.
    await settleResponseBodies()
  })

  // ---- interlink.har ------------------------------------------------------
  // Covers the gaps -> single-line interlink for a line with POST-MIDNIGHT service
  // (Egged line 402, operator_ref=3, line_ref=33267 — the '...הורדה...' direction —
  // on 2024-02-12). This 24/7 line has actual rides just past midnight the next
  // calendar day (extended-hour token 24:30) with vehicle locations, so the
  // destination page can surface and select them. Records BOTH pages in one context:
  //   * /gaps:            rides_execution for the route (the clickable post-midnight cells)
  //   * /single-line-map: gtfs_routes + siri_rides + siri_vehicle_locations + planned stops
  test('record interlink.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/interlink.har')
    const settleResponseBodies = trackResponseBodies(page)

    // -- gaps side --
    await goToPage(page, '/')
    await goToPage(page, '/gaps')
    await page.getByLabel('חברה מפעילה').click()
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('402')
    await page.waitForLoadState('networkidle')
    // Type-to-filter the route Autocomplete (defeats option virtualization on lines
    // with many variants), then pick the line_ref 33267 direction ('...הורדה...').
    await page.getByLabel(/בחירת מסלול נסיעה/).fill('הורדה')
    await page.waitForLoadState('networkidle')
    // Wait for the gaps response to finish before navigating away, so it is not
    // aborted at teardown and recorded as a status:-1 empty entry.
    const gapsLoaded = page.waitForResponse((r) => r.url().includes('/rides_execution/list'))
    await page.getByRole('option', { name: /הורדה/ }).first().click()
    await gapsLoaded
    await page.waitForLoadState('networkidle')

    // CRITICAL: settle all gaps-side bodies BEFORE navigating to single-line below.
    // The final settleResponseBodies() runs only at test end — after this navigation —
    // and any gaps body still streaming when we leave the page is dropped from the HAR
    // (recorded empty, with no status:-1 to flag it). That empties the rides_execution
    // payload, so the replayed gaps table has no post-midnight cells. Settling here
    // forces rides_execution (and the route lists) to fully download first.
    await settleResponseBodies()

    // -- single-line side: same route, then select the post-midnight (24:30) ride --
    await goToPage(page, '/single-line-map')
    await page.getByLabel('חברה מפעילה').click()
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('402')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/בחירת מסלול נסיעה/).fill('הורדה')
    await page.waitForLoadState('networkidle')
    await page.getByRole('option', { name: /הורדה/ }).first().click()
    await page.waitForLoadState('networkidle')
    const startTime = page.getByLabel('בחירת שעת התחלה')
    if ((await startTime.count()) > 0) {
      // Type-to-filter the start-time Autocomplete too (~100 options on this line).
      await startTime.fill('24:30')
      await page.waitForLoadState('networkidle')
      const pm = page.getByRole('option', { name: /24:30/ }).first()
      if ((await pm.count()) > 0) {
        const locations = page
          .waitForResponse((r) => r.url().includes('/siri_vehicle_locations/list'))
          .then((r) => r.body())
        await pm.click()
        await locations
      } else {
        await page.keyboard.press('Escape')
      }
    }

    await page.waitForLoadState('networkidle')
    await settleResponseBodies()
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

  // realtimemap.har self-records from tests/realtimemap.spec.ts (RECORD_HAR=1), not here — its
  // replay and record flows are identical, so both live in that one file.
})
