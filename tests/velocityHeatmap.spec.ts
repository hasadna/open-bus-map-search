import { expect, setupTest, test, visitPage } from './utils'

test.describe('Velocity Heatmap', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'velocity_heatmap_page_title')
  })

  test('navigates to /velocity-heatmap', async ({ page }) => {
    await expect(page).toHaveURL(/velocity-heatmap/)
  })

  test('shows page title', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Velocity Aggregation Heatmap', level: 1 }),
    ).toBeVisible()
  })

  test('shows date selector', async ({ page }) => {
    await expect(page.getByRole('group').first()).toBeVisible()
  })

  test('shows all three visualization mode options', async ({ page }) => {
    await expect(page.getByText('Visualize Avg Speed')).toBeVisible()
    await expect(page.getByText('Visualize Std')).toBeVisible()
    await expect(page.getByText('Visualize Std / Avg Speed (Coeff of Var)')).toBeVisible()
  })

  test('avg is the default selected visualization mode', async ({ page }) => {
    const avgRadio = page.locator('input[name="visMode"][value="avg"]')
    await expect(avgRadio).toBeChecked()
  })

  test('can switch visualization mode', async ({ page }) => {
    const stdRadio = page.locator('input[name="visMode"][value="std"]')
    await stdRadio.click()
    await expect(stdRadio).toBeChecked()
    await expect(page.locator('input[name="visMode"][value="avg"]')).not.toBeChecked()
  })
})
