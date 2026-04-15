import { expect, setupTest, test, visitPage } from './utils'

test.describe('Velocity Heatmap Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'velocity_heatmap_page_title')
  })

  test('page displays heading and date controls', async ({ page }) => {
    await expect(page.locator('h4').first()).toBeVisible()
    await expect(page.getByRole('textbox').first()).toBeVisible()
  })

  test('page displays visualization mode radio buttons', async ({ page }) => {
    const radios = page.getByRole('radio')
    await expect(radios).toHaveCount(3)
    await expect(radios.first()).toBeChecked()
  })

  test('switching visualization mode updates the selected radio', async ({ page }) => {
    const radios = page.getByRole('radio')
    await radios.nth(1).click()
    await expect(radios.nth(1)).toBeChecked()
    await expect(radios.first()).not.toBeChecked()
  })

  test('page displays a map container', async ({ page }) => {
    const mapContainer = page.locator('.leaflet-container')
    await expect(mapContainer).toBeVisible()
  })

  test('map has expand button', async ({ page }) => {
    const expandButton = page.locator('.expand-button')
    await expect(expandButton).toBeVisible()
  })

  test('date navigation buttons are present', async ({ page }) => {
    const prevDay = page.getByRole('button', { name: /יום קודם|Previous day/i })
    const nextDay = page.getByRole('button', { name: /יום הבא|Next day/i })
    await expect(prevDay).toBeVisible()
    await expect(nextDay).toBeVisible()
  })
})
