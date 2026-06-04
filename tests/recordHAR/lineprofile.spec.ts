import { test } from '@playwright/test'
import { goToPage, setupRecording } from './utils'

test.describe('Record lineprofile.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  // Records the queries fired by navigating directly to /profile/{id}:
  //   * gtfs_routes/get?id=... (loader)
  //   * gtfs_routes/list?route_short_name=... (useSingleLineData routes for line)
  //   * siri_rides/list?... (start-time options)
  // Route id 4339841 is the operator 97 / line 16 route for 2024-02-12 used by the
  // single-line tests; it is stable for the frozen test date.
  test('record lineprofile.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/lineprofile.har')
    await goToPage(page, '/')
    await goToPage(page, '/profile/4339841')
    // Wait for the SIRI rides response so start-time options are populated in the HAR.
    await page
      .waitForResponse((r) => r.url().includes('/siri_rides/list'), { timeout: 30000 })
      .catch(() => undefined)
    await page.waitForLoadState('networkidle')
  })
})
