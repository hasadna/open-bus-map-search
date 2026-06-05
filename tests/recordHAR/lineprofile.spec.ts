import { goToPage, recordTest } from './utils'

// Route id 4339841 is the operator 97 / line 16 route for 2024-02-12 used by the
// single-line tests; it is stable for the frozen test date.
const ROUTE_ID = '4339841'

// Records the queries fired by navigating directly to /profile/{id}:
//   * gtfs_routes/get?id=... (loader)
//   * gtfs_routes/list?route_short_name=... (useSingleLineData routes for line)
//   * siri_rides/list?... (start-time options)
recordTest('lineprofile.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, `/profile/${ROUTE_ID}`)
  // Wait for the SIRI rides response so start-time options are populated in the HAR.
  await page
    .waitForResponse((r) => r.url().includes('/siri_rides/list'), { timeout: 30000 })
    .catch(() => undefined)
  await page.waitForLoadState('networkidle')
})
