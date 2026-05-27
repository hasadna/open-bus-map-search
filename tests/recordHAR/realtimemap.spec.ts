import { test } from '@playwright/test'
import { goToPage, setupRecording } from './utils'

test.describe('Record realtimemap.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  test('record realtimemap.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/realtimemap.har')
    await goToPage(page, '/')
    await goToPage(page, '/map')

    // Wait for chunkedLoading to finish and for all react-leaflet Popup effects to run.
    await page.waitForTimeout(5000)

    // Zoom in once so individual markers appear within the visible viewport.
    // At the default zoom (8) the only individual marker is ~200px below the fold.
    await page.locator('.leaflet-control-zoom-in').click()
    // leaflet-zoom-anim is added to .leaflet-map-pane at animation start and removed at zoomend.
    await page
      .waitForFunction(() => !!document.querySelector('.leaflet-map-pane.leaflet-zoom-anim'), {
        timeout: 2000,
      })
      .catch(() => {})
    await page.waitForFunction(
      () => !document.querySelector('.leaflet-map-pane.leaflet-zoom-anim'),
      { timeout: 10000 },
    )
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

    // Click the first in-viewport individual bus marker.
    const gtfsRoutesResponse = page.waitForResponse(/gtfs_routes\/list/, { timeout: 30000 })
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

    // Wait for the popup to open and the route data to load.
    await page.locator('.bus-tooltip').waitFor({ state: 'visible', timeout: 10000 })
    await page.waitForFunction(() => document.querySelector('.bus-tooltip .content') !== null, {
      timeout: 30000,
    })
    const gtfsResp = await gtfsRoutesResponse
    await gtfsResp.body()
    await page.waitForLoadState('networkidle', { timeout: 30000 })
  })
})
