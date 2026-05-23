import { test } from '@playwright/test'
import { goToPage, setupRecording } from './utils'

test.describe('Record dashboard.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  test('record dashboard.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/dashboard.har')
    await goToPage(page, '/')
    await page.goto('/dashboard')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    // Reload so the page component is already in memory: PersistQueryClientProvider
    // async hydration completes faster, and the three group_by requests are
    // in-flight before networkidle fires — so they get captured in the HAR.
    await page.reload()
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
  })
})
