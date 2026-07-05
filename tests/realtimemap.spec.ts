import * as fs from 'fs'
import { Locator, Page } from '@playwright/test'
import { expect, harOptions, setupTest, test, trackResponseBodies, visitPage } from './utils'

// RECORD_HAR=1 re-records the fixture instead of replaying it:
//   RECORD_HAR=1 npx playwright test tests/realtimemap.spec.ts --workers=1
// Record and replay share this one flow. The clock is frozen to the recorded minute, so the
// assertions below also validate a fresh capture — a bad recording fails the run, not CI later.
const RECORDING = !!process.env['RECORD_HAR']

const HAR_PATH = 'tests/HAR/realtimemap.har'

// Bridges beforeEach (arm before the firehose) → test (settle after the tooltip). No-op on replay.
let settleResponseBodies: (() => Promise<unknown>) | undefined

// The frozen clock (2024-02-12) makes the map default to 2024-02-11T04:00 — the recorded minute.
// If date/timezone handling drifts, the request stops matching the HAR, aborts, and the map shows
// 0 vehicles: this count catches it. The tooltip's parsed values guard api-client deserialization.
const VEHICLE_COUNT = 393

// The lone נתיב אקספרס bus (operator 14) is the only vehicle of its operator this minute, so its
// marker is unique and safe to single out.
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
 * At default zoom markercluster merges every vehicle, so no single marker is clickable. The lone
 * נתיב אקספרס bus is the country's northernmost vehicle this minute, so the topmost on-screen
 * cluster always holds it: drill into that cluster until the marker separates out, open its
 * tooltip, and return the popup content locator (resolves once BusToolTip has fetched the route).
 * Lives here, not in utils, because it drives both the replay assertions and the record capture.
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
  // Click the topmost (northernmost) on-screen cluster to zoom in, re-cluster, and repeat until the
  // marker separates out. Clicking the element (not coordinates) auto-waits for the zoom animation
  // to settle, so a still-moving cluster can't make the click miss.
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
    await page.waitForTimeout(700)
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
    // setupTest aborts stride-api. routeFromHAR({ update:true }) records passively and registers
    // NO route (playwright-core returns right after _recordIntoHAR), so unlike the replay handler
    // it can't override that abort — left in place it kills every request. Unroute it first, then
    // arm body-tracking before visitPage so no firehose page is missed.
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
    // Exact count ⇒ the app hit the right window (HAR matched) and parsed the whole paginated firehose.
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

  // Record only: wait for every stride body (incl. the tooltip's route fetch) before teardown writes the HAR.
  await settleResponseBodies?.()
})

// Record only: Playwright writes the HAR on one line; re-serialize it pretty for reviewable diffs.
// afterAll runs after the context teardown that flushes the HAR, so the file is complete here.
test.afterAll(() => {
  if (!RECORDING) return
  const har = JSON.parse(fs.readFileSync(HAR_PATH, 'utf8'))
  fs.writeFileSync(HAR_PATH, JSON.stringify(har, null, 2) + '\n')
})
