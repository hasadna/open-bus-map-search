import { expect, setupTest, test, visitPage } from './utils'

test.describe('Public Appeal Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'public_appeal_title')
  })

  test('page renders without error', async ({ page }) => {
    await expect(page).toHaveURL(/\/public-appeal/)
  })

  test('page has proper RTL layout', async ({ page }) => {
    const dir = await page.locator('html').getAttribute('dir')
    expect(dir).toBe('rtl')
  })
})
