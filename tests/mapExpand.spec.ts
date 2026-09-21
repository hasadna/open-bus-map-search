import { expect, setupTest, test, visitPage } from './utils'

test.beforeEach(async ({ page }) => {
  await setupTest(page)
  await visitPage(page, 'time_based_map_page_title')
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
