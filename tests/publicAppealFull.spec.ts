import { expect, setupTest, test, visitPage } from './utils'

test.describe('Public Appeal Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'public_appeal_title')
  })

  test('page displays heading', async ({ page }) => {
    await expect(page.locator('h4').first()).toBeVisible()
  })

  test('page displays task list items', async ({ page }) => {
    const listItems = page.locator('ol li, ul li')
    const count = await listItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('page has proper RTL layout', async ({ page }) => {
    const dir = await page.locator('html').getAttribute('dir')
    expect(dir).toBe('rtl')
  })
})
