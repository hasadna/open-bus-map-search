/**
 * HAR Recording Utilities
 *
 * How and when to (re)record HAR fixtures: see the "Recording HAR fixtures"
 * section in CONTRIBUTING.md.
 */
import { Page } from '@playwright/test'
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

export async function goToPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
}

export async function openDropdownAndWait(page: Page, selector: string) {
  await page.locator(selector).click()
  await page.waitForLoadState('networkidle')
}
