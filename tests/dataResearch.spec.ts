import { expect, setupTest, test } from './utils'

test.describe('Data Research Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('accessing /data-research directly works', async ({ page }) => {
    await page.goto('/data-research')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/data-research/)
  })

  test('page displays research section heading', async ({ page }) => {
    await page.goto('/data-research')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    const title = page.locator('h2', { hasText: 'מחקרים' })
    await expect(title).toBeVisible()
  })

  test('page displays research description text', async ({ page }) => {
    await page.goto('/data-research')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText('אם יש לכם רעיון מעניין למה קורים פה דברים, דברו איתנו בסלאק!'),
    ).toBeVisible()
  })

  test('stacked research section with charts is rendered', async ({ page }) => {
    await page.goto('/data-research')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    const etlWidget = page.locator('h2', { hasText: 'בעיות etl/gps/משהו גלובאלי אחר' })
    await expect(etlWidget).toBeVisible()
  })

  test('research page has date selectors and operator selector', async ({ page }) => {
    await page.goto('/data-research')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    const startDateGroup = page.getByRole('group', { name: 'התחלה' }).first()
    const endDateGroup = page.getByRole('group', { name: 'סיום' }).first()
    await expect(startDateGroup).toBeVisible()
    await expect(endDateGroup).toBeVisible()
  })
})
