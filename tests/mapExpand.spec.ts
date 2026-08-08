import { expect, setupTest, test, visitPage } from './utils'

test.beforeEach(async ({ page }) => {
  await setupTest(page)
  await visitPage(page, 'time_based_map_page_title')
})

// The button used to be viewport-`fixed` and dragged back over the map by a
// scroll/resize hook, which let it drift outside the map whenever the hook
// missed an event. It is now the bottom segment of Leaflet's zoom bar, so
// containment is structural and it has to read as one control with the zoom
// links rather than a separate floating box.
test('the expand button is the bottom segment of the zoom bar', async ({ page }) => {
  const zoomOut = page.locator('.leaflet-control-zoom .leaflet-control-zoom-out')
  const expand = page.locator('.leaflet-control-zoom .expand-button')

  await expect(expand).toBeVisible()
  const zoomOutBox = (await zoomOut.boundingBox())!
  const expandBox = (await expand.boundingBox())!

  expect(expandBox.width).toBe(zoomOutBox.width)
  expect(expandBox.x).toBe(zoomOutBox.x)
  expect(expandBox.y).toBeCloseTo(zoomOutBox.y + zoomOutBox.height, 0)
})

test('expanding the map covers the whole window', async ({ page }) => {
  const viewport = page.viewportSize()!

  await page.locator('.expand-button').click()

  const expandedMap = page.locator('.map-info.expanded')
  await expect(expandedMap).toBeVisible()
  expect(await expandedMap.boundingBox()).toEqual({
    x: 0,
    y: 0,
    width: viewport.width,
    height: viewport.height,
  })
})
