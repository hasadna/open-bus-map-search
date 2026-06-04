import { goToPage, recordTest } from './utils'

recordTest('singleline.har', async (page) => {
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
