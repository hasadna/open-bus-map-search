import { test, expect } from './utils'
test.describe('About Page Tests', () => {
  test.beforeEach(({ advancedRouteFromHAR }) => {
    advancedRouteFromHAR('tests/HAR/clearbutton.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'abort',
      url: /stride-api/,
    })
  })

  test('after clicking "about" menu item, user should redirect to "about" page', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByText('אודות').click()
    await expect(page).toHaveURL(/about/)
    const locator = page.locator('li').filter({ hasText: 'אודות' })
    await expect(locator).toHaveClass(/menu-item-selected/)
  })
  test('page title should be `מהו אתר “דאטאבוס”?`', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: 'מהו אתר “דאטאבוס”?' })).toBeVisible()
  })
  test('clicking dontaions link should lead to "sadna" site', async ({ page }) => {
    await page.goto('/about')
    await page.getByRole('link', { name: 'תרומות קטנות נוספות' }).click()
    await page.getByRole('heading', { name: 'הסדנא לידע ציבורי פותחת ומנגישה מידע' }).waitFor()
  })

  test('clicking the links under "privacy" should lead to Google analytics', async ({ page }) => {
    await page.goto('/');
    await page.getByText('אודות').click()
    await page.getByRole('link', { name: 'Google Analytics' }).click();
    await expect(page).toHaveURL("https://marketingplatform\.google\.com\/about\/analytics/")
    await page.goto('/');
    await page.getByText('אודות').click()
    await page.getByRole('link', { name: 'קראו כאן' }).click();
    await expect(page).toHaveURL(/support\.google\.com\/analytics\/answer\/6004245\?hl=iw/)
  });
})
