import { expect, setupTest, test } from './utils'

const MENU_ITEMS = [
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

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('should display logo and menu items correctly', async ({ page }) => {
  await expect(page.locator('h1.sidebar-logo')).toContainText('דאטאבוס')
  await expect(page.locator('ul > li a')).toContainText(MENU_ITEMS)
})

test("the main header doesn't show duplicate icons", async ({ page }) => {
  const headerLocator = page.locator('div.header-links')
  const svgLocators = headerLocator.locator('svg')
  const innerHTMLs = await svgLocators.evaluateAll((svgs) => svgs.map((svg) => svg.innerHTML))
  expect(innerHTMLs).not.toHaveDuplications()
  expect(innerHTMLs.length).toBeGreaterThan(0)
})

test('make sure the corner GitHub icon leads to DataBus GitHub project', async ({ page }) => {
  const page1Promise = page.waitForEvent('popup')
  await page.getByLabel('למעבר אל GitHub').locator('svg').click()
  const page1 = await page1Promise
  await expect(page1).toHaveURL(/open-bus-map-search/)
  await expect(page1.getByRole('heading', { name: 'open-bus-map-search' })).toBeVisible()
})
