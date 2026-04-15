import i18next from 'i18next'
import Selectors from './SelectorsModel'
import { expect, fillDateField, harOptions, setupTest, test, visitPage } from './utils'

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

  test('date selector is present and interactive', async ({ page }) => {
    const dateGroup = page.getByRole('group', { name: 'תאריך' }).first()
    await expect(dateGroup).toBeVisible()
    await fillDateField(page, 'תאריך', '10/02/2024')
  })

  test('operator dropdown opens and has options', async ({ page }) => {
    const { operator } = new Selectors(page)
    await operator.click()
    const options = page.getByRole('option')
    await expect(options.first()).toBeVisible()
    const count = await options.count()
    expect(count).toBeGreaterThan(0)
  })

  test('line number selector is present and accepts input', async ({ page }) => {
    const { operator, lineNumber } = new Selectors(page)
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
    await expect(lineNumber).toBeVisible()
    await lineNumber.fill('64')
    await expect(lineNumber).toHaveValue('64')
  })

  test('route selector appears after selecting operator and line number', async ({ page }) => {
    await fillDateField(page, 'תאריך')
    const { operator, lineNumber, route } = new Selectors(page)
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
    await lineNumber.fill('64')
    await page
      .getByRole('option', {
        name: 'הרב עובדיה יוסף/שלום צלח-פתח תקווה ⟵ מסוף כרמלית/הורדה-תל אביב יפו',
      })
      .click()
    await expect(route).toBeVisible()
  })

  test('line not found message shows for invalid line number', async ({ page }) => {
    const { operator, lineNumber } = new Selectors(page)
    await operator.click()
    await page.getByRole('option', { name: 'דן בדרום', exact: true }).click()
    await lineNumber.fill('9999')
    await expect(page.getByText(i18next.t('line_not_found'))).toBeVisible()
  })
})
