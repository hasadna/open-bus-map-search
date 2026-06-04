import { goToPage, recordTest } from './utils'

// Selections mirror the consumer (tests/singlelineTest.spec.ts) exactly: same
// operator / line / route / vehicle / start time. The HAR is replayed with
// notFound:'abort', so anything the recorder fails to capture becomes an aborted
// request in the consumer. Each step waits on the concrete API responses it
// triggers (and forces their bodies); clicks rely on Playwright's built-in
// auto-waiting rather than explicit timeouts.
const ROUTE_NAME =
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
const BUS_MARKER = '.leaflet-marker-pane > img[src$="marker-dot.png"]'

recordTest('singleline.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/single-line-map')

  // Operator dropdown (gtfs_agencies/list) → אודליה מוניות בעמ (operator_ref=97)
  await page.getByLabel('חברה מפעילה').click()
  await page.waitForLoadState('networkidle')
  await page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true }).click()

  // Line 16 (gtfs_routes/list?route_short_name=16)
  await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
  await page.waitForLoadState('networkidle')

  // Select the exact route the consumer uses. It fires the ride, its ride_stops, and
  // one gtfs_stops/get per endpoint stop — those fire a render tick after networkidle,
  // so wait until both have come back before advancing, or they get dropped.
  const bothStops = new Promise<void>((resolve) => {
    const seen = new Set<string>()
    page.on('response', (r) => {
      if (r.url().includes('/gtfs_stops/get')) {
        seen.add(r.url())
        if (seen.size >= 2) resolve()
      }
    })
  })
  await page.getByLabel(/בחירת מסלול נסיעה/).click()
  await page.getByRole('option', { name: ROUTE_NAME }).click()
  await bothStops
  await page.waitForLoadState('networkidle')

  // First start time (earliest departure — stable; the consumer's anti-regression test
  // clicks .first() here too). Capture the siri_vehicle_locations it triggers.
  const lineLocations = page.waitForResponse((r) =>
    r.url().includes('/siri_vehicle_locations/list'),
  )
  await page.getByLabel('בחירת שעת התחלה').click()
  await page.getByRole('option').first().click()
  await lineLocations.then((r) => r.body())
  await page.waitForLoadState('networkidle')

  // Click a bus marker (records BusToolTip's gtfs_routes/list?line_refs=…). click() auto-waits
  // for the marker to be present and actionable.
  await page.locator(BUS_MARKER).nth(2).click({ force: true })
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Escape')

  // Fill line 9999 to record the empty routes response.
  const emptyRoutes = page.waitForResponse(
    (r) => r.url().includes('/gtfs_routes/list') && r.url().includes('route_short_name=9999'),
  )
  await page.getByRole('textbox', { name: 'מספר קו' }).fill('9999')
  await (await emptyRoutes).body()
  await page.waitForLoadState('networkidle')

  // Vehicle-number search (siri_rides/list?vehicle_refs=7489226)
  const vehicleRides = page.waitForResponse(
    (r) => r.url().includes('/siri_rides/list') && r.url().includes('vehicle_refs=7489226'),
  )
  await page.getByRole('button', { name: 'לפי מספר רכב' }).click()
  await page.getByRole('textbox', { name: 'מספר רכב' }).fill('7489226')
  await vehicleRides
  await page.waitForLoadState('networkidle')

  // Select 04:30 vehicle start time → siri_vehicle_locations + gtfs_routes?line_refs=.
  // Force both bodies (.body() blocks until the full payload arrives).
  const vehicleLocationsBody = page
    .waitForResponse((r) => r.url().includes('/siri_vehicle_locations/list'))
    .then((r) => r.body())
  const gtfsRoutesByLineRefBody = page
    .waitForResponse((r) => r.url().includes('/gtfs_routes/list') && r.url().includes('line_refs='))
    .then((r) => r.body())
  await page.getByLabel('בחירת שעת התחלה').click()
  await page.getByRole('option', { name: /04:30/ }).first().click()
  await Promise.all([vehicleLocationsBody, gtfsRoutesByLineRefBody])
})
