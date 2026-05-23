import { test } from '@playwright/test'
import { goToPage, setupRecording } from './utils'

test.describe('Record operator.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  test('record operator.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/operator.har')
    await goToPage(page, '/')
    await goToPage(page, '/operator')

    // Open operator dropdown (triggers gtfs_agencies/list)
    await page.getByRole('button', { name: 'פתח' }).click()
    await page.waitForLoadState('networkidle')

    // Select אגד — triggers group_by × 2 + gtfs_routes/list via React state update.
    // Click-triggered requests are in-flight before we call networkidle, so it
    // correctly waits for all three responses (unlike navigation-triggered requests).
    const routesPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/gtfs_routes/list') && response.url().includes('limit=15000'),
    )
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    const routesResponse = await routesPromise
    await routesResponse.body()
    await page.waitForLoadState('networkidle')
  })
})
