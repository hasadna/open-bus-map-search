import { goToPage, recordTest } from './utils'

// The Egged bus marker, named by agency (MapRouteLayer: name = agencyName). The
// consumer test (tests/realtimemap.spec.ts) clicks the same one, which keeps the
// recorded gtfs_routes/list?line_refs=… in sync with the consumer's click.
const MARKER = 'אגד אגד'

recordTest('realtimemap.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/map')

  // Wait for chunkedLoading to finish and for all react-leaflet Popup effects to run.
  await page.waitForTimeout(5000)

  // Click the marker by agency name — NOT by viewport position — so the recorded route
  // is the one BusToolTip requests on the consumer's click, independent of ordering.
  // (No zoom: the consumer clicks at default zoom and Playwright scrolls the marker
  // into view, so recording at the same view state keeps the two in sync.)
  const marker = page.getByRole('button', { name: MARKER })
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
