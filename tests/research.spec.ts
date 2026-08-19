import { expect, setupTest, test } from './utils'

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('research page opens with an easter egg', async ({ page }) => {
  await page.waitForLoadState('networkidle')
  await page.keyboard.type('geek')
  await page.locator('.body').click()
  await expect(page).toHaveURL(/data-research/)
  const title = page.locator('h2', { hasText: 'מחקרים' })
  await expect(title).toBeVisible()
})
