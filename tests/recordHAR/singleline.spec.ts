import he from 'src/locale/he.json' with { type: 'json' }
import { goToPage, recordTest } from './utils'

// Transit data this recording depends on existing for the frozen test date. These
// mirror the consumer (tests/singlelineTest.spec.ts) exactly — the HAR is replayed
// with notFound:'abort', so the recorder must select the same data the consumer does.
const OPERATOR = 'אודליה מוניות בעמ'
const LINE = '16'
const ROUTE = 'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
const VEHICLE = '7489226'
const START_TIME = /04:30/
const MISSING_LINE = '9999'

// Each step waits on the concrete API responses it triggers (and forces their bodies);
// clicks rely on Playwright's built-in auto-waiting rather than explicit timeouts.
recordTest('singleline.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/single-line-map')

  // Operator dropdown (gtfs_agencies/list) → operator_ref=97
  await page.getByLabel(he.choose_operator).click()
  await page.waitForLoadState('networkidle')
  await page.getByRole('option', { name: OPERATOR, exact: true }).click()

  // Line 16 (gtfs_routes/list?route_short_name=16)
  await page.getByRole('textbox', { name: he.choose_line }).fill(LINE)
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
  await page.getByRole('option', { name: ROUTE }).click()
  await bothStops
  await page.waitForLoadState('networkidle')

  // First start time (earliest departure — stable; the consumer's anti-regression test
  // clicks .first() here too). Capture the siri_vehicle_locations it triggers.
  const lineLocations = page.waitForResponse((r) =>
    r.url().includes('/siri_vehicle_locations/list'),
  )
  await page.getByLabel(he.choose_start_time).click()
  await page.getByRole('option').first().click()
  await lineLocations.then((r) => r.body())
  await page.waitForLoadState('networkidle')

  // Click a bus marker (records BusToolTip's gtfs_routes/list?line_refs=…). click() auto-waits
  // for the marker to be present and actionable.
  await page
    .locator('.leaflet-marker-pane > img[src$="marker-dot.png"]')
    .nth(2)
    .click({ force: true })
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Escape')

  // Fill a non-existent line to record the empty routes response.
  const emptyRoutes = page.waitForResponse(
    (r) =>
      r.url().includes('/gtfs_routes/list') && r.url().includes(`route_short_name=${MISSING_LINE}`),
  )
  await page.getByRole('textbox', { name: he.choose_line }).fill(MISSING_LINE)
  await (await emptyRoutes).body()
  await page.waitForLoadState('networkidle')

  // Vehicle-number search (siri_rides/list?vehicle_refs=…)
  const vehicleRides = page.waitForResponse(
    (r) => r.url().includes('/siri_rides/list') && r.url().includes(`vehicle_refs=${VEHICLE}`),
  )
  await page.getByRole('button', { name: he.singleline_map_page_vehicle_id }).click()
  await page.getByRole('textbox', { name: he.choose_vehicle }).fill(VEHICLE)
  await vehicleRides
  await page.waitForLoadState('networkidle')

  // Select the vehicle start time → siri_vehicle_locations + gtfs_routes?line_refs=.
  // Force both bodies (.body() blocks until the full payload arrives).
  const vehicleLocationsBody = page
    .waitForResponse((r) => r.url().includes('/siri_vehicle_locations/list'))
    .then((r) => r.body())
  const gtfsRoutesByLineRefBody = page
    .waitForResponse((r) => r.url().includes('/gtfs_routes/list') && r.url().includes('line_refs='))
    .then((r) => r.body())
  await page.getByLabel(he.choose_start_time).click()
  await page.getByRole('option', { name: START_TIME }).first().click()
  await Promise.all([vehicleLocationsBody, gtfsRoutesByLineRefBody])
})
