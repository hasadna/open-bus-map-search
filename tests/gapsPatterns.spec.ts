import i18next from 'i18next'
import Selectors from './SelectorsModel'
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
    const startDateGroup = page.getByRole('group', { name: 'התחלה' }).first()
    const endDateGroup = page.getByRole('group', { name: 'סיום' }).first()
    await expect(startDateGroup).toBeVisible()
    await expect(endDateGroup).toBeVisible()
  })

  test('date selectors accept input', async ({ page }) => {
    await fillDateField(page, 'התחלה', '01/02/2024')
    await fillDateField(page, 'סיום', '08/02/2024')
  })

  test('operator selector is present and has options', async ({ page }) => {
    const { operator } = new Selectors(page)
    await operator.click()
    const options = page.getByRole('option')
    await expect(options.first()).toBeVisible()
    const count = await options.count()
    expect(count).toBeGreaterThan(0)
  })

  test('line number selector works after selecting operator', async ({ page }) => {
    const { operator, lineNumber } = new Selectors(page)
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
    await expect(lineNumber).toBeVisible()
    await lineNumber.fill('64')
    await expect(lineNumber).toHaveValue('64')
  })

  test('route selector appears after selecting operator and line', async ({ page }) => {
    await fillDateField(page, 'התחלה')
    await fillDateField(page, 'סיום')
    const { operator, lineNumber } = new Selectors(page)
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
    await lineNumber.fill('64')
    await page
      .getByRole('option', {
        name: 'הרב עובדיה יוסף/שלום צלח-פתח תקווה ⟵ מסוף כרמלית/הורדה-תל אביב יפו',
      })
      .click()
    const routeSelect = page.locator('#route-select')
    await expect(routeSelect).toBeVisible()
  })

  test('invalid date range shows error alert', async ({ page }) => {
    await fillDateField(page, 'התחלה', '15/02/2024')
    await fillDateField(page, 'סיום', '01/02/2024')
    await expect(page.getByText(i18next.t('bug_date_alert'))).toBeVisible()
  })
})
