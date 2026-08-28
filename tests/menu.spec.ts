import { Page } from '@playwright/test'
import { expect, setupTest, test } from './utils'

const DATA_MENU_ITEMS = [
  'מסלול נסיעה',
  'היסטוריית נסיעות',
  'נסיעות שלא בוצעו',
  'דפוסי נסיעות שלא בוצעו',
  'חברה מפעילה',
  'רכב',
  'רכבת ישראל',
  'מפת תחבורה',
  'מפת מהירות',
]

const COMMUNITY_MENU_ITEMS = ['קול קורא', 'אודות', 'לתרומות']

const menuLinks = (page: Page) => page.locator('.sidebar-menu:visible').locator('ul > li a')

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('should display logo and menu items correctly', async ({ page }) => {
  await expect(page.locator('.main-header .header-logo')).toHaveAccessibleName('דאטאבוס')
  await expect(menuLinks(page)).toContainText(DATA_MENU_ITEMS)
})

// The menu carries no "home" row — the header logo is the way back. If that ever stops
// being a link home, the sidebar has to grow the row back.
test('the logo is the way back to the homepage', async ({ page }) => {
  await page.getByRole('tab', { name: 'קהילה' }).click()
  await page.getByRole('link', { name: 'אודות', exact: true }).click()
  await expect(page).toHaveURL(/\/about/)
  await page.locator('.main-header .header-logo').click()
  await expect(page).toHaveURL((url) => url.pathname === '/')
})

test('the community tab swaps the list', async ({ page }) => {
  await page.getByRole('tab', { name: 'קהילה' }).click()
  await expect(menuLinks(page)).toContainText(COMMUNITY_MENU_ITEMS)
})

test('the tab follows the open page', async ({ page }) => {
  await page.getByRole('tab', { name: 'קהילה' }).click()
  await page.getByRole('link', { name: 'אודות', exact: true }).click()
  await expect(page).toHaveURL(/\/about/)
  // Landing on a community page must leave the community tab selected, or the menu
  // would contradict the URL.
  await expect(page.getByRole('tab', { name: 'קהילה' })).toHaveAttribute('aria-selected', 'true')
})

test('a deep link to a community page opens on the community tab', async ({ page }) => {
  await page.goto('/about')
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await expect(page.getByRole('tab', { name: 'קהילה' })).toHaveAttribute('aria-selected', 'true')
  await expect(menuLinks(page)).toContainText(COMMUNITY_MENU_ITEMS)
})

test("the main header doesn't show duplicate icons", async ({ page }) => {
  const headerLocator = page.locator('div.header-links')
  const svgLocators = headerLocator.locator('svg')
  const innerHTMLs = await svgLocators.evaluateAll((svgs) => svgs.map((svg) => svg.innerHTML))
  expect(innerHTMLs).not.toHaveDuplications()
  expect(innerHTMLs.length).toBeGreaterThan(0)
})

test('make sure the corner GitHub icon leads to DataBus GitHub project', async ({
  page,
  context,
}) => {
  await context.route(/github\.com/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body><h1>open-bus-map-search</h1></body></html>',
    }),
  )
  const page1Promise = page.waitForEvent('popup')
  await page.getByLabel('למעבר אל GitHub').locator('svg').click()
  const page1 = await page1Promise
  await expect(page1).toHaveURL(/open-bus-map-search/)
  await expect(page1.getByRole('heading', { name: 'open-bus-map-search' })).toBeVisible()
})
