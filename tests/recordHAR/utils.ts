/**
 * HAR Recording Utilities
 *
 * How and when to (re)record HAR fixtures: see the "Recording HAR fixtures"
 * section in CONTRIBUTING.md.
 */
import { Page, test } from '@playwright/test'
import { getPastDate } from '../utils'

export async function setupRecording(page: Page, harFile: string) {
  // Clear storage so React Query's cache and search state don't skip network requests.
  await page.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.clock.setSystemTime(getPastDate())
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  await page.route(/api\.github\.com/, (route) => route.abort())
  await page.route(/open-bus-backend\.k8s\.hasadna\.org\.il/, (route) => route.abort())
  await page.route(/.*openstreetmap*/, (route) => route.abort())
  // NOTE: stride-api is NOT aborted here, so real responses are recorded into the HAR
  await page.routeFromHAR(harFile, {
    url: /stride-api/,
    update: true,
    updateContent: 'embed',
    updateMode: 'full',
  })
}

/**
 * Wraps a HAR recorder spec: skips unless RECORD_HAR=1, sets up recording into
 * `tests/HAR/<harName>`, then runs the navigation `body`. Keeps the per-recorder
 * boilerplate (describe / skip / setupRecording) in one place.
 */
export function recordTest(
  harName: string,
  body: (page: Page) => Promise<void>,
  options: { timeout?: number } = {},
) {
  test.describe(`Record ${harName}`, () => {
    test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

    test(`record ${harName}`, async ({ page }) => {
      if (options.timeout) test.setTimeout(options.timeout)
      await setupRecording(page, `tests/HAR/${harName}`)
      await body(page)
    })
  })
}

export async function goToPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
}

export async function openDropdownAndWait(page: Page, selector: string) {
  await page.locator(selector).click()
  await page.waitForLoadState('networkidle')
}
