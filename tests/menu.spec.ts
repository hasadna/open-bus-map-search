import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  await page.goto('/')
})

test('should display logo and menu items correctly', async ({ page }) => {
  await expect(page.locator('h1.sidebar-logo')).toContainText('דאטאבוס')
  const menuItemsInOrder = [
    'ראשי',
    'קיום נסיעות',
    'היסטוריית נסיעות',
    'נסיעות שלא בוצעו',
    'דפוסי נסיעות שלא בוצעו',
    'מפה לפי זמן',
    'מפת מהירות',
    'מפה לפי קו',
    'חברה מפעילה',
    'אודות',
    'לתרומות',
    'קול קורא',
  ]
  await expect(page.locator('ul > li a')).toContainText(menuItemsInOrder)
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

test('make sure the corner GitHub icon leads to DataBus GitHub project', async ({ page }) => {
  await page.goto('/')
  const page1Promise = page.waitForEvent('popup')
  await page.getByLabel('למעבר אל GitHub').locator('svg').click()
  const page1 = await page1Promise
  await expect(page1).toHaveURL(/open-bus-map-search/)
  await expect(page1.getByRole('heading', { name: 'open-bus-map-search' })).toBeVisible()
})
