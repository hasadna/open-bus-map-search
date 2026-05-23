import { customMatcher } from 'playwright-advanced-har'
import { expect, getPastDate, harOptions, setupTest, test, visitPage } from './utils'

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

// The individual bus marker that gets clicked can be any operator/line depending
// on which marker ends up unclustered at the default zoom.  Use a matcher that
// ignores those params so the single gtfs_routes/list HAR entry always matches.
const realtimemapHarOptions = {
  ...harOptions,
  matcher: customMatcher({
    urlComparator(a: string, b: string) {
      const paramsToIgnore = new Set([
        't',
        'limit',
        'date_from',
        'date_to',
        'operator_refs',
        'line_refs',
      ])
      function normalize(url: string) {
        const urlObj = new URL(url)
        for (const param of paramsToIgnore) {
          urlObj.searchParams.delete(param)
        }
        const sortedParams = Array.from(urlObj.searchParams.entries()).sort(([a], [b]) =>
          a.localeCompare(b),
        )
        urlObj.search = new URLSearchParams(sortedParams).toString()
        urlObj.pathname = urlObj.pathname.replace(/\/$/, '')
        return urlObj.toString()
      }
      return normalize(a) === normalize(b)
    },
  }),
}

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await page.clock.setSystemTime(getPastDate())
  await advancedRouteFromHAR('tests/HAR/realtimemap.har', realtimemapHarOptions)
  await visitPage(page, 'time_based_map_page_title')
  // Wait for chunkedLoading to finish and all react-leaflet Popup effects to run.
  await page.waitForTimeout(5000)
  // Zoom in once so individual markers appear within the visible viewport.
  await page.locator('.leaflet-control-zoom-in').click()
  await page.waitForFunction(
    () => {
      const icons = document.querySelectorAll('.leaflet-marker-pane .my-div-icon')
      return Array.from(icons).some((el) => {
        const r = el.getBoundingClientRect()
        return (
          r.x >= 0 &&
          r.y >= 0 &&
          r.x + r.width <= window.innerWidth &&
          r.y + r.height <= window.innerHeight
        )
      })
    },
    { timeout: 10000 },
  )
})

test('tooltip appears after clicking on map point', async ({ page }) => {
  await test.step('Click on a bus button', async () => {
    const coords = await page.evaluate(() => {
      const icons = document.querySelectorAll('.leaflet-marker-pane .my-div-icon')
      const el = Array.from(icons).find((el) => {
        const r = el.getBoundingClientRect()
        return (
          r.x >= 0 &&
          r.y >= 0 &&
          r.x + r.width <= window.innerWidth &&
          r.y + r.height <= window.innerHeight
        )
      })
      const r = el!.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    })
    await page.mouse.click(coords.x, coords.y)
  })

  await test.step('Click inside the tooltip', async () => {
    await page.getByRole('button', { name: 'הצג מידע לגיקים' }).click()
    await page.getByRole('button', { name: 'הסתר מידע לגיקים' }).click()
  })

  await test.step('Expecting the tooltip to have the correct content', async () => {
    const textList = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.content ul li'))
        .map((li) =>
          Array.from(li.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim() || ''),
        )
        .flat()
        .filter((value) => value !== '')
    })
    expect(textList).toEqual(TOOLTIP_CONTENT_ITEMS)
  })
})
