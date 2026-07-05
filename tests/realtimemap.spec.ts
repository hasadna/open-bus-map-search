import * as fs from 'fs'
import { Locator, Page } from '@playwright/test'
import {
  expect,
  harOptions,
  setupTest,
  test,
  trackResponseBodies,
  visitPage,
  waitForMapIdle,
} from './utils'

// RECORD_HAR=1 self-records the fixture instead of replaying it (record and replay share this
// flow, so the assertions also validate a fresh capture):
//   RECORD_HAR=1 npx playwright test tests/realtimemap.spec.ts --workers=1
const RECORDING = !!process.env['RECORD_HAR']

const HAR_PATH = 'tests/HAR/realtimemap.har'

// Set in beforeEach when recording, awaited at test end so the HAR captures every body. No-op on replay.
let settleResponseBodies: (() => Promise<unknown>) | undefined

// 90 = the fixture's 393 raw rows after useVehicleLocations dedups per-minute snapshot re-stamps.
// Exact count guards date/HAR drift: if the frozen-clock request stops matching the HAR the map shows 0.
const VEHICLE_COUNT = 90

// The lone נתיב אקספרס bus this minute — unique operator, so safe to single out.
const BUS = {
  operatorName: 'נתיב אקספרס',
  lineNumber: '967',
  origin: 'קדושת לוי/שלום רב-ביתר עילית',
  destination: 'ת. מרכזית צפת/הורדה-צפת',
}

const TOOLTIP_CONTENT_ITEMS = [
  'שם חברה מפעילה:',
  'מוצא:',
  'יעד:',
  'מהירות:',
  'זמן דגימה:',
  'לוחית רישוי:',
  'כיוון נסיעה:',
  'נ.צ.:',
]

/**
 * Clusters hide every marker at default zoom. The lone נתיב אקספרס bus is the northernmost vehicle,
 * so the topmost on-screen cluster always holds it: drill in until the marker separates, open its
 * tooltip, return the popup content locator. Drives both the replay assertions and the record capture.
 */
const openNorthernmostBus = async (page: Page, operatorName: string): Promise<Locator> => {
  // Expand the map to full height (idempotent) so clusters below the fold become clickable.
  const expand = page.locator('.map-info.collapsed .expand-button')
  if (await expand.isVisible().catch(() => false)) {
    await expand.click()
    await page.waitForTimeout(1000) // let the resize settle before drilling
  }

  const height = page.viewportSize()?.height ?? 720
  const clusters = page.locator('.leaflet-marker-pane .leaflet-marker-icon.marker-cluster')
  const button = page.getByRole('button', { name: `${operatorName} ${operatorName}` })
  // Settle the initial recenter pan before reading cluster geometry.
  await waitForMapIdle(page)
  // Click the topmost cluster to zoom/re-cluster, repeat until the marker separates. waitForMapIdle
  // (not a fixed sleep) settles the zoom so the next iteration reads cluster coordinates correctly.
  for (let i = 0; i < 12; i++) {
    if (await button.isVisible().catch(() => false)) break
    const index = await clusters.evaluateAll((els, viewportHeight) => {
      const onScreen = els
        .map((el, idx) => ({
          idx,
          mid: el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2,
        }))
        .filter((c) => c.mid > 0 && c.mid < viewportHeight)
        .sort((a, b) => a.mid - b.mid)
      return onScreen.length ? onScreen[0].idx : -1
    }, height)
    if (index < 0) break
    await clusters
      .nth(index)
      .click({ timeout: 5000 })
      .catch(() => undefined)
    await waitForMapIdle(page)
  }
  await expect(button).toBeVisible({ timeout: 5000 })

  // The marker may still be settling, so retry the click until the popup (BusToolTip) opens.
  const content = page.locator('.leaflet-popup div.content')
  await expect(async () => {
    await button.click()
    await expect(content).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 15000 })
  return content
}

// Record only: delete the HAR so the fresh capture can't merge into stale entries.
test.beforeAll(() => {
  if (RECORDING) fs.rmSync(HAR_PATH, { force: true })
})

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  if (RECORDING) {
    // routeFromHAR({ update:true }) records passively without registering a route, so it can't
    // override setupTest's stride-api abort — unroute that first, then arm body-tracking before visitPage.
    await page.unroute(/stride-api/)
    await page.routeFromHAR(HAR_PATH, {
      url: /stride-api/,
      update: true,
      updateContent: 'embed',
      updateMode: 'full',
    })
    settleResponseBodies = trackResponseBodies(page)
  } else {
    await advancedRouteFromHAR(HAR_PATH, harOptions)
  }
  await visitPage(page, 'time_based_map_page_title')
})

test('map loads real vehicle data and shows a bus tooltip', async ({ page }) => {
  await test.step('the real snapshot is loaded', async () => {
    // Exact count ⇒ HAR matched and the whole paginated firehose parsed.
    await expect(page.getByText(`${VEHICLE_COUNT} -`, { exact: false })).toBeVisible()
  })

  await test.step('open the lone נתיב אקספרס bus tooltip', async () => {
    await openNorthernmostBus(page, BUS.operatorName)
  })

  await test.step('the tooltip renders the expected labels', async () => {
    const labels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('div.content ul li'))
        .flatMap((li) =>
          Array.from(li.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim() || ''),
        )
        .filter(Boolean),
    )
    expect(labels).toEqual(TOOLTIP_CONTENT_ITEMS)
  })

  await test.step('the tooltip renders the bus’s real values', async () => {
    const content = page.locator('div.content')
    await expect(content).toContainText(BUS.operatorName)
    await expect(content).toContainText(BUS.origin)
    await expect(content).toContainText(BUS.destination)
    await expect(page.getByRole('link', { name: BUS.lineNumber })).toBeVisible() // line number is in the header link
  })

  // Record only: await every stride body before teardown writes the HAR.
  await settleResponseBodies?.()
})

// Record only: re-serialize the one-line HAR pretty for reviewable diffs (afterAll runs after the
// teardown that flushes it, so the file is complete here).
test.afterAll(() => {
  if (!RECORDING) return
  const har = JSON.parse(fs.readFileSync(HAR_PATH, 'utf8'))
  fs.writeFileSync(HAR_PATH, JSON.stringify(har, null, 2) + '\n')
})
