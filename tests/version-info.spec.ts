import { expect, setupTest, test, visitPage } from './utils'

const VERSION_URL = 'https://open-bus-map-search.hasadna.org.il/hash.txt'

test.describe('Version info tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'about_title')
  })

  test('should see loading state', async ({ page }) => {
    await page.route(VERSION_URL, () => void 0)
    // scoped to the widget: the contributors list on the same page shows the very same
    // `loading` string while its own request is in flight
    const versionHeading = page.getByRole('heading', { name: 'גרסה' })
    await expect(versionHeading).toBeVisible()
    await expect(versionHeading.locator('..').getByText('טוען...')).toBeVisible()
    await page.getByLabel('החלף שפה').first().click()
    await page.getByText('English').click()
    await page.waitForTimeout(500)
    const versionHeadingEn = page.getByRole('heading', { name: 'Current version identifier' })
    await expect(versionHeadingEn).toBeVisible()
    await expect(versionHeadingEn.locator('..').getByText('loading...')).toBeVisible()
  })

  test('should see version', async ({ page }) => {
    await page.route(VERSION_URL, (route) => route.fulfill({ body: 'my version' }))
    await expect(page.getByText('my version')).toBeVisible()
  })

  test('should see error message', async ({ page }) => {
    await page.route(VERSION_URL, (route) => route.abort())
    await expect(page.getByText('נכשל בטעינת מידע')).toBeVisible({ timeout: 15_000 })
    await page.getByLabel('החלף שפה').first().click()
    await page.getByText('English').click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Failed to fetch current version identifier')).toBeVisible()
  })
})
