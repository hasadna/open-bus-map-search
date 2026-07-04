import type { Page } from '@playwright/test'
import { expect, harOptions, setupTest, test, visitPage } from './utils'

/**
 * Gaps <-> single-line interlink, with emphasis on POST-MIDNIGHT rides.
 *
 * Data: Egged line 402 (Tel-Aviv <-> Jerusalem), operator_ref 3 / line_ref 33267,
 * on the frozen test date 2024-02-12. This 24/7 line runs past midnight: it has
 * actual rides at 00:00-01:00 the next calendar day, which the frontend service-day
 * model shows as extended-hour tokens 24:00-25:00. The gaps table shows them as
 * clickable cells (wall-clock "00:30"); the link carries rideTime=24-30 so the
 * single-line page reconstructs the right departure.
 *
 * Recorded by the `interlink.har` block in recordHAR.spec.ts. If the recording
 * selects a different 402 variant or the post-midnight times shift, update
 * PM_DISPLAY / PM_TOKEN_URL below to match.
 */

const OPERATOR = 'אגד'
const LINE = '402'
const ROUTE_FILTER = 'הורדה' // 402 direction Ayalon->Jerusalem (line_ref 33267); unique to it
const ROUTE = new RegExp(ROUTE_FILTER)
const SERVICE_DAY = '2024-02-12'
const PM_DISPLAY = '00:30' // wall-clock time shown in the gaps cell
const PM_TOKEN_URL = '24-30' // extended-hour token carried in the share URL (dash form)
const PM_MOON = '🌙' // next-night marker shown beside post-midnight times in the dropdown

async function selectRoute(page: Page) {
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('option', { name: OPERATOR, exact: true }).click()
  await page.getByRole('combobox', { name: 'מספר קו' }).fill(LINE)
  // Type-to-filter the route Autocomplete so the target option renders even when
  // the line has many variants (MUI virtualizes long option lists).
  await page.getByLabel(/בחירת מסלול נסיעה/).fill(ROUTE_FILTER)
  await page.getByRole('option', { name: ROUTE }).first().click()
}

test.describe('gaps <-> single-line interlink (post-midnight)', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/interlink.har', harOptions)
  })

  test('clicking a post-midnight gap opens single-line on the extended-hour ride, and back returns to gaps', async ({
    page,
  }) => {
    await visitPage(page, 'gaps_page_title')
    await selectRoute(page)

    // Two cells read "00:30" — the selected day's own early-morning ride (rideTime=00-30)
    // and the post-midnight one (rideTime=24-30). Pick the post-midnight cell by its
    // extended-hour token in the href; it must still DISPLAY the wall-clock time.
    const gapLink = page.locator(`a[href*="rideTime=${PM_TOKEN_URL}"]`)
    await expect(gapLink).toBeVisible({ timeout: 10000 })
    // The link shows the wall-clock time; the row carries the moon marker in its leading column.
    await expect(gapLink).toHaveText(PM_DISPLAY)
    await expect(page.locator(`tr:has(a[href*="rideTime=${PM_TOKEN_URL}"])`)).toContainText(PM_MOON)
    await gapLink.click()

    // Interlink: navigates to single-line carrying the EXTENDED-hour token and the
    // same service day (not the next calendar day).
    await page.waitForURL(/single-line-map/)
    const params = new URL(page.url()).searchParams
    expect(params.get('rideTime')).toBe(PM_TOKEN_URL)
    expect(params.get('date')).toBe(SERVICE_DAY)

    // The destination resolved the route from the URL and selected the extended-hour ride.
    await expect(page.getByLabel(/בחירת מסלול נסיעה/)).toHaveValue(/.+/, { timeout: 10000 })
    await expect(page.locator('#start-time-select')).toBeEditable({ timeout: 10000 })
    // The dropdown shows the wall-clock time (00:30), NOT the extended token (24:30),
    // with a moon marking it as a next-night ride.
    await expect(page.getByLabel('בחירת שעת התחלה')).toHaveValue(new RegExp(PM_DISPLAY))
    await expect(page.getByLabel('בחירת שעת התחלה')).toHaveValue(new RegExp(PM_MOON))

    // Back navigation returns to the gaps page with the same route/state restored.
    await page.goBack()
    await page.waitForURL(/gaps/)
    await expect(page.locator(`a[href*="rideTime=${PM_TOKEN_URL}"]`)).toBeVisible({
      timeout: 10000,
    })
  })
})
