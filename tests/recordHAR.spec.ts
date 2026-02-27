/**
 * HAR Recording Script
 *
 * Run this to update HAR fixtures when API responses change:
 *   cd .trees/block-network
 *   RECORD_HAR=1 npx playwright test tests/recordHAR.spec.ts --workers=1
 *
 * After running, commit the updated HAR files in tests/HAR/.
 */
import { Page, test } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

function getPastDate() {
  return new Date('2024-02-12T15:00:00+00:00')
}

async function setupRecording(page: Page, harFile: string) {
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

async function goToPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
}

async function openDropdownAndWait(page: Page, selector: string) {
  await page.locator(selector).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Record HAR files', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  // ---- timeline.har -------------------------------------------------------
  // Single test records ALL needed entries in one browser context
  test('record timeline.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/timeline.har')
    await goToPage(page, '/')
    await goToPage(page, '/timeline')

    // Trigger agencies list by opening operator dropdown
    await openDropdownAndWait(page, '#operator-select')

    // Select אגד and fill line 1 (triggers routes list)
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await page.getByPlaceholder('לדוגמה: 17א').fill('1')
    await page.waitForLoadState('networkidle')

    // Open route dropdown and wait for options to load
    await openDropdownAndWait(page, '#route-select')

    // Select route to trigger stops fetch
    const routeWithStops =
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  '
    const routeExists = await page.getByRole('option', { name: routeWithStops }).count()
    if (routeExists > 0) {
      await page.getByRole('option', { name: routeWithStops }).click()
      await page.waitForLoadState('networkidle')
      await openDropdownAndWait(page, '#stop-select')
      await page.keyboard.press('Escape')
    } else {
      await page.keyboard.press('Escape')
    }

    // Select route used for timeline hits test
    await openDropdownAndWait(page, '#route-select')
    const routeWithHits = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
    const hitsRouteExists = await page.getByRole('option', { name: routeWithHits }).count()
    if (hitsRouteExists > 0) {
      await page.getByRole('option', { name: routeWithHits }).click()
      await page.waitForLoadState('networkidle')
      await openDropdownAndWait(page, '#stop-select')
      const stopOption = page.getByRole('option', { name: 'חיים הרצוג/שדרות מנחם בגין (גדרה)' })
      if ((await stopOption.count()) > 0) {
        await stopOption.click()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    } else {
      await page.keyboard.press('Escape')
    }

    // Also test אגד operator without clearing (so duplication test passes)

    // Test empty routes: switch to דן בדרום + line 9999
    // First clear the operator by navigating away and back
    await page.goto('/timeline')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await openDropdownAndWait(page, '#operator-select')
    const danBaDarom = page.getByRole('option', { name: 'דן בדרום', exact: true })
    if ((await danBaDarom.count()) > 0) {
      await danBaDarom.click()
      await page.getByPlaceholder('לדוגמה: 17א').fill('9999')
      await page.waitForTimeout(3000)
      await page.waitForLoadState('networkidle')
    } else {
      await page.keyboard.press('Escape')
    }
  })

  // ---- operator.har -------------------------------------------------------
  // Single test records ALL needed entries in one browser context
  test('record operator.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/operator.har')
    await goToPage(page, '/')
    await goToPage(page, '/operator')

    // Open operator dropdown (triggers gtfs_agencies/list)
    await page.getByRole('button', { name: 'פתח' }).click()
    await page.waitForLoadState('networkidle')

    // Select אגד (triggers group_by × 2 + gtfs_routes/list)
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await page.waitForLoadState('networkidle')
  })

  // ---- singleline.har -----------------------------------------------------
  // Single test records ALL needed entries in one browser context
  test('record singleline.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/singleline.har')
    await goToPage(page, '/')
    await goToPage(page, '/single-line-map')

    // Open operator dropdown (triggers gtfs_agencies/list)
    await page.getByLabel('חברה מפעילה').click()
    await page.waitForLoadState('networkidle')

    // Select אודליה מוניות בעמ (operator_ref=97)
    const operator = page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true })
    if ((await operator.count()) > 0) {
      await operator.click()
    } else {
      await page.keyboard.press('Escape')
    }

    // Fill line 16 (triggers gtfs_routes/list with route_short_name=16)
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
    await page.waitForLoadState('networkidle')

    // Select a route (triggers gtfs_rides/list, gtfs_ride_stops/list, gtfs_stops/get, siri data)
    const routeDropdown = page.getByLabel(/בחירת מסלול נסיעה/)
    if ((await routeDropdown.count()) > 0) {
      await routeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstRoute = page.getByRole('option').first()
      if ((await firstRoute.count()) > 0) {
        await firstRoute.click()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // Select start time to trigger siri data fetch
    const startTimeDropdown = page.getByLabel('בחירת שעת התחלה')
    if ((await startTimeDropdown.count()) > 0) {
      await startTimeDropdown.click()
      await page.waitForLoadState('networkidle')
      const firstTime = page.getByRole('option').first()
      if ((await firstTime.count()) > 0) {
        await firstTime.click()
        await page.waitForLoadState('networkidle')
      } else {
        await page.keyboard.press('Escape')
      }
    }

    // Fill line 9999 to record the empty routes response
    await page.getByRole('textbox', { name: 'מספר קו' }).fill('9999')
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')
  })

  // ---- clearbutton.har ----------------------------------------------------
  // Single test records ALL needed entries in one browser context
  test('record clearbutton.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/clearbutton.har')
    await goToPage(page, '/')
    await goToPage(page, '/timeline')

    // Trigger agencies list
    await openDropdownAndWait(page, '#operator-select')

    // Select אלקטרה אפיקים and fill line 64
    const elktraOption = page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true })
    if ((await elktraOption.count()) > 0) {
      await elktraOption.click()
      await page.getByPlaceholder('לדוגמה: 17א').fill('64')
      await page.waitForLoadState('networkidle')
      // Open route dropdown to ensure routes are fetched
      await openDropdownAndWait(page, '#route-select')
      await page.keyboard.press('Escape')
    } else {
      await page.keyboard.press('Escape')
    }
  })
})
