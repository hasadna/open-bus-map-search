import he from 'src/locale/he.json' with { type: 'json' }
import { goToPage, openDropdownAndWait, recordTest } from './utils'

// Transit data this recording depends on existing for the frozen test date.
const OPERATOR = 'אגד'
const LINE = '1'
const ROUTE = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
const STOP = 'חיים הרצוג/שדרות מנחם בגין (גדרה)'
// Second round: an operator + line combination with no matching route, to record the
// empty-routes response.
const EMPTY_OPERATOR = 'דן בדרום'
const MISSING_LINE = '9999'

recordTest('timeline.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/timeline')

  // Trigger agencies list by opening operator dropdown
  await openDropdownAndWait(page, '#operator-select')

  // Select the operator and fill the line (triggers routes list)
  await page.getByRole('option', { name: OPERATOR, exact: true }).click()
  await page.getByPlaceholder(he.line_placeholder).fill(LINE)
  await page.waitForLoadState('networkidle')

  // Select the route used for the timeline-hits test. The route's stop fan-out
  // (gtfs_stops/get per stop) completes during the networkidle waits below.
  await openDropdownAndWait(page, '#route-select')
  await page.getByRole('option', { name: ROUTE, exact: true }).click()
  await page.waitForLoadState('networkidle')

  // Select the stop → loads the timeline: a stop-window gtfs_ride_stops/list and the
  // matching siri_vehicle_locations. Wait on those responses instead of the loading
  // spinner (.MuiCircularProgress-svg), which can hang and abort the rest of the run.
  await openDropdownAndWait(page, '#stop-select')
  const stopRideStops = page.waitForResponse(
    (r) => r.url().includes('/gtfs_ride_stops/list') && r.url().includes('arrival_time_from'),
  )
  const stopLocations = page.waitForResponse(
    (r) =>
      r.url().includes('/siri_vehicle_locations/list') && r.url().includes('recorded_at_time_from'),
  )
  await page.getByRole('option', { name: STOP }).click()
  await Promise.all([stopRideStops.then((r) => r.body()), stopLocations.then((r) => r.body())])
  await page.waitForLoadState('networkidle')

  // Empty-routes round: switch operator + line 9999 (records the 2nd gtfs_agencies/list
  // and the empty gtfs_routes/list). Navigate away and back to clear.
  await page.goto('/timeline')
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await openDropdownAndWait(page, '#operator-select')
  await page.getByRole('option', { name: EMPTY_OPERATOR, exact: true }).click()
  const emptyRoutes = page.waitForResponse(
    (r) =>
      r.url().includes('/gtfs_routes/list') && r.url().includes(`route_short_name=${MISSING_LINE}`),
  )
  await page.getByPlaceholder(he.line_placeholder).fill(MISSING_LINE)
  await (await emptyRoutes).body()
  await page.getByText(he.line_not_found).waitFor({ state: 'visible' })
})
