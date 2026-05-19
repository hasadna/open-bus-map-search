import i18next from 'i18next'
import { expect, fillDateField, harOptions, setupTest, test, visitPage } from './utils'

test.describe('Gaps Patterns Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/patterns.har', harOptions)
    await visitPage(page, 'gaps_patterns_page_title')
  })

  test('page heading is displayed', async ({ page }) => {
    await expect(page.locator('h4')).toContainText(i18next.t('gaps_patterns_page_title'))
  })

  test('page description is visible', async ({ page }) => {
    await expect(page.getByText(i18next.t('gaps_patterns_page_description'))).toBeVisible()
  })

  test('start and end date selectors are present', async ({ page }) => {
    const dateInputs = page.locator('input[type="text"]')
    const count = await dateInputs.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('date selectors accept input', async ({ page }) => {
    await fillDateField(page, 'התחלה', '01/02/2024')
    await fillDateField(page, 'סיום', '08/02/2024')
  })

  test('operator selector is present', async ({ page }) => {
    await expect(page.getByLabel(i18next.t('choose_operator'))).toBeVisible()
  })
})
