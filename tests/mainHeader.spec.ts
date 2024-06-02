import { test, expect } from './utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test("the main header doesn't show duplicate icons", async ({ page }) => {
  const headerLocator = page.locator('div.header-links')
  const svgLocators = headerLocator.locator('svg')
  const svgCount = await svgLocators.count()
  const svgInnerHTML = []
  for (let i = 0; i < svgCount; i++) {
    const innerHTML = await svgLocators.nth(i).innerHTML()
    svgInnerHTML.push(innerHTML)
  }
  const svgCountWithoutDuplicates = new Set(svgInnerHTML).size
  expect(svgCountWithoutDuplicates).toBe(svgCount)
})
