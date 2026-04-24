import i18next from 'i18next'
import { expect, harOptions, setupTest, test, visitPage } from './utils'

test.describe('Gaps Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/missing.har', harOptions)
    await visitPage(page, 'gaps_page_title')
  })

  test('page title is visible', async ({ page }) => {
    await expect(page.locator('h4')).toHaveText(i18next.t('gaps_page_title'))
  })

  test('page description alert is visible', async ({ page }) => {
    await expect(page.getByText(i18next.t('gaps_page_description'))).toBeVisible()
  })

  test('date selector is present', async ({ page }) => {
    const dateInput = page.locator('input[type="text"]').first()
    await expect(dateInput).toBeVisible()
  })

  test('operator selector is present', async ({ page }) => {
    await expect(page.getByLabel(i18next.t('choose_operator'))).toBeVisible()
  })

  test('line number selector is present', async ({ page }) => {
    await expect(page.getByLabel(i18next.t('choose_line'))).toBeVisible()
  })
})
