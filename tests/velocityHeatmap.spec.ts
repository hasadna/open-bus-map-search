import i18next from 'i18next'
import { expect, setupTest, test, visitPage } from './utils'

test.describe('Velocity Heatmap Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'velocity_heatmap_page_title')
  })

  test('page displays heading and date controls', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Velocity Aggregation Heatmap' })).toBeVisible()
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
    await expect(
      page.getByRole('button', { name: i18next.t('date_navigator_prev_day') }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: i18next.t('date_navigator_next_day') }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: i18next.t('date_navigator_prev_week') }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: i18next.t('date_navigator_next_week') }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: i18next.t('date_navigator_today') }),
    ).toBeVisible()
  })

  test('clicking prev/next day buttons changes the date', async ({ page }) => {
    const dateInput = page.locator('input.MuiPickersInputBase-input').first()
    const initialValue = await dateInput.inputValue()

    await page.getByRole('button', { name: i18next.t('date_navigator_prev_day') }).click()
    await page.waitForTimeout(300)
    const afterPrevDay = await dateInput.inputValue()
    expect(afterPrevDay).not.toEqual(initialValue)

    await page.getByRole('button', { name: i18next.t('date_navigator_next_day') }).click()
    await page.waitForTimeout(300)
    const afterNextDay = await dateInput.inputValue()
    expect(afterNextDay).toEqual(initialValue)
  })
})
