import { goToPage, openDropdownAndWait, recordTest } from './utils'

recordTest('timeline.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/timeline')

  // Trigger agencies list by opening operator dropdown
  await openDropdownAndWait(page, '#operator-select')

  // Select אגד and fill line 1 (triggers routes list)
  await page.getByRole('option', { name: 'אגד', exact: true }).click()
  await page.getByPlaceholder('לדוגמה: 17א').fill('1')
  await page.waitForLoadState('networkidle')

  // Select the route used for the timeline-hits test. The route's stop fan-out
  // (gtfs_stops/get per stop) completes during the networkidle waits below.
  await openDropdownAndWait(page, '#route-select')
  const routeWithHits = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
  await page.getByRole('option', { name: routeWithHits, exact: true }).click()
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
  await page.getByRole('option', { name: 'חיים הרצוג/שדרות מנחם בגין (גדרה)' }).click()
  await Promise.all([stopRideStops.then((r) => r.body()), stopLocations.then((r) => r.body())])
  await page.waitForLoadState('networkidle')

  // Empty-routes round: switch operator to דן בדרום + line 9999 (records the 2nd
  // gtfs_agencies/list and the empty gtfs_routes/list). Navigate away and back to clear.
  await page.goto('/timeline')
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await openDropdownAndWait(page, '#operator-select')
  await page.getByRole('option', { name: 'דן בדרום', exact: true }).click()
  const emptyRoutes = page.waitForResponse(
    (r) => r.url().includes('/gtfs_routes/list') && r.url().includes('route_short_name=9999'),
  )
  await page.getByPlaceholder('לדוגמה: 17א').fill('9999')
  await (await emptyRoutes).body()
  await page.getByText('הקו לא נמצא').waitFor({ state: 'visible' })
})
