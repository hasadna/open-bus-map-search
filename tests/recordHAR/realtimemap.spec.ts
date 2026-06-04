import { goToPage, recordTest } from './utils'

recordTest('realtimemap.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/map')

  // Wait for chunkedLoading to finish and for all react-leaflet Popup effects to run.
  await page.waitForTimeout(5000)

  // Click the SAME marker the consumer test (tests/realtimemap.spec.ts) clicks: the
  // Egged ('אגד אגד') bus marker, selected by agency name — NOT by viewport position.
  // Markers are named by agency (MapRouteLayer: name = agencyName), and the consumer
  // uses getByRole('button', { name: 'אגד אגד' }). Matching that exact locator here
  // guarantees the recorded gtfs_routes/list?line_refs=… route is the one BusToolTip
  // requests on the consumer's click, independent of vehicle-location ordering.
  // (No zoom: the consumer clicks at default zoom and Playwright scrolls the marker
  // into view, so recording at the same view state keeps the two in sync.)
  const marker = page.getByRole('button', { name: 'אגד אגד' })
  const gtfsRoutesResponse = page.waitForResponse(/gtfs_routes\/list/, { timeout: 30000 })
  await marker.click()
  await marker.click({ force: true })

  // Wait for the popup to open and the route data to load before capturing the body.
  await page.locator('.bus-tooltip').waitFor({ state: 'visible', timeout: 10000 })
  await page.waitForFunction(() => document.querySelector('.bus-tooltip .content') !== null, {
    timeout: 30000,
  })
  const gtfsResp = await gtfsRoutesResponse
  await gtfsResp.body()
  await page.waitForLoadState('networkidle', { timeout: 30000 })
})
