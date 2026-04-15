import { expect, setupTest, test } from './utils'

test.describe('Line Profile Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('navigating to a profile route loads without error', async ({ page }) => {
    await page.goto('/profile/1')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await expect(page).toHaveURL(/\/profile\/1/)
  })

  test('profile page displays a map container', async ({ page }) => {
    await page.goto('/profile/1')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await expect(page.locator('.leaflet-container')).toBeVisible()
  })
})
