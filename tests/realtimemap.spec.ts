import * as fs from 'fs'
import { Locator, Page } from '@playwright/test'
import { expect, harOptions, setupTest, test, trackResponseBodies, visitPage } from './utils'

// Set RECORD_HAR=1 to re-record the fixture instead of replaying it:
//   RECORD_HAR=1 npx playwright test tests/realtimemap.spec.ts --workers=1
// The recording flow IS this test's flow (navigate to /map, decluster to the lone נתיב אקספרס
// bus, open its tooltip), so record and replay share one file instead of a duplicate block in
// recordHAR.spec.ts. Better still: because the clock is frozen to the same minute, a fresh
// recording still holds 393 vehicles and that bus — so the assertions below double as validation
// of the new fixture. A bad capture (a truncated body, or stride dropping this historical minute)
// fails the run instead of silently committing a broken blob.
const RECORDING = !!process.env['RECORD_HAR']

const HAR_PATH = 'tests/HAR/realtimemap.har'

// trackResponseBodies must be armed before the /map firehose streams in (i.e. before visitPage in
// beforeEach), but settled only after the test has opened the bus tooltip — so the callback is
// stashed here to bridge beforeEach → test. Undefined (a no-op) on the replay path.
let settleResponseBodies: (() => Promise<unknown>) | undefined

// The map defaults to yesterday 04:00 Israel time; against the frozen test clock (2024-02-12)
// that is exactly 2024-02-11T04:00, the minute tests/HAR/realtimemap.har was recorded for.
//
// The mock only replays when the request matches, and the URL matcher keys on the exact
// recorded_at_time window (it ignores date_from/date_to but NOT recorded_at_time_*). So if the
// app's date/timezone handling drifts, the computed window stops matching, the request aborts
// (harOptions.notFound = 'abort') and the map loads zero vehicles — the count assertion below
// catches it. Clicking the bus and asserting its deserialized values guards the api-client's
// field/date parsing the same way: those concrete strings change even though the bytes don't.
const VEHICLE_COUNT = 393

// The lone נתיב אקספרס bus (operator 14, line 967) is the country's northernmost vehicle at this
// minute — the only vehicle of its operator — so its marker is unique and safe to single out.
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
 * The /map page plots every vehicle in the country, so at the default zoom markercluster
 * merges them and no single bus marker is individually clickable. This drills into the
 * northern cluster — the lone נתיב אקספרס bus is the country's northernmost vehicle at this
 * minute, so the topmost (= northernmost) on-screen cluster always contains it — clicking to
 * zoom in until the bus's own marker appears, then opens its tooltip and returns the popup
 * content locator (which resolves only once BusToolTip has fetched the route details).
 *
 * Locating the bus is this spec's own job — it drives both the replay assertions and (in
 * RECORD_HAR mode) the click that captures BusToolTip's route call — so it lives here rather
 * than in shared utils or baked into the fixture: the HAR stays a plain verbatim capture of
 * the firehose response.
 */
const openNorthernmostBus = async (page: Page, operatorName: string): Promise<Locator> => {
  // The map only fills part of a 1280x720 viewport, so most clusters sit below the fold where
  // clicks can't land. Expand it to full height first (idempotent — only if still collapsed) so
  // every cluster stays on-screen and clickable while we drill.
  const expand = page.locator('.map-info.collapsed .expand-button')
  if (await expand.isVisible().catch(() => false)) {
    await expand.click()
    // Let the resize settle so cluster positions are final before we start drilling.
    await page.waitForTimeout(1000)
  }

  const height = page.viewportSize()?.height ?? 720
  const clusters = page.locator('.leaflet-marker-pane .leaflet-marker-icon.marker-cluster')
  const button = page.getByRole('button', { name: `${operatorName} ${operatorName}` })
  // Drill: click the topmost on-screen cluster (the northernmost one, holding our bus) to zoom
  // into it. Re-cluster and repeat until the individual marker separates out and is clickable.
  // Click the cluster *element* (not raw coordinates): locator.click auto-waits for it to stop
  // moving, so a zoom still animating from the previous step can't make the click miss.
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

  // The marker can still be settling after the last zoom, so a single click may not register on
  // the map. Retry the click until the popup (BusToolTip) opens.
  const content = page.locator('.leaflet-popup div.content')
  await expect(async () => {
    await button.click()
    await expect(content).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 15000 })
  return content
}

// Record only: start from a clean slate so a re-record can't merge into stale entries — the HAR
// is written fresh at context teardown. No-op (and no file touched) on the replay path.
test.beforeAll(() => {
  if (RECORDING) fs.rmSync(HAR_PATH, { force: true })
})

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  if (RECORDING) {
    // setupTest registers page.route(/stride-api/, abort). routeFromHAR({ update:true }) does NOT
    // register a competing route — in update mode it only switches on passive context-level HAR
    // recording (playwright-core: routeFromHAR returns right after _recordIntoHAR when update is
    // set), so it can't override the abort the way the replay handler below does. Left in place,
    // the abort would kill every stride request and the HAR would record nothing. Drop it first so
    // real responses reach the network and get captured — the same reason recordHAR.spec.ts's
    // setupRecording never aborts stride. Arm body-tracking before visitPage so no page is missed.
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
    // The page prints how many vehicles it parsed. Matching the exact recorded count confirms
    // both that the app computed the right time window (mock matched) and that the api-client
    // paginated and deserialized the whole firehose response.
    await expect(page.getByText(`${VEHICLE_COUNT} -`, { exact: false })).toBeVisible()
  })

  await test.step('open the lone נתיב אקספרס bus tooltip', async () => {
    // Every vehicle in the country is clustered at the default zoom; drill in and open its tooltip.
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
    // Line number lives in the header link, next to the labelled content block.
    await expect(page.getByRole('link', { name: BUS.lineNumber })).toBeVisible()
  })

  // Record mode only: ensure every stride-api body (including BusToolTip's route fetch, opened
  // above) has fully downloaded before the HAR is written at context teardown. No-op on replay.
  await settleResponseBodies?.()
})

// Record only: Playwright writes the HAR minified onto a single line. Re-serialize it pretty so
// the committed fixture stays reviewable and future re-records produce readable diffs. Runs in
// afterAll — after the browser context has closed and flushed the HAR to disk (the single test's
// context tears down before this fires), so the file is complete by the time we read it.
test.afterAll(() => {
  if (!RECORDING) return
  const har = JSON.parse(fs.readFileSync(HAR_PATH, 'utf8'))
  fs.writeFileSync(HAR_PATH, JSON.stringify(har, null, 2) + '\n')
})
