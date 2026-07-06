import { expect, fillDateField, harOptions, setupTest, test, waitForSkeletonsToHide } from './utils'

const TRIP_EXISTENCE_ITEMS = [
  'קיום נסיעות',
  'הקווים הגרועים ביותר',
  'אחוזי יציאה מסך הנסיעות לפי יום',
]

test.describe('dashboard tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/dashboard.har', harOptions)
    await page.goto('/dashboard')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    await page.getByText('הקווים הגרועים ביותר').waitFor()
    await waitForSkeletonsToHide(page)
  })

  // NOTE: the former zero-assertion 'dark mode use localstorage' test was removed
  // here — theme persistence is being covered properly on the lightweight Home
  // page (PR #1698's tests/theme.spec.ts), instead of paying the 7.9 MB dashboard
  // HAR to assert nothing.

  test('dashboard charts contain information', async ({ page }) => {
    await expect(page.getByText('686 | קווים').first()).toBeVisible()
    await expect(page.getByText('מועצה אזורית גולן').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'אגד', exact: true })).toBeVisible()
  })

  test('Trip Existence page items', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(TRIP_EXISTENCE_ITEMS)
  })

  test('choosing params in "קיום נסיעות" and organize by date/hour ', async ({ page }) => {
    await fillDateField(page, 'התחלה', '02/6/2024')
    await fillDateField(page, 'סיום', '02/6/2024')
    await page.getByLabel('חברה מפעילה').click()
    await page.getByRole('option', { name: 'דן', exact: true }).click()

    // The group-by toggle swaps the chart widget's title between its hour and day
    // variants (DayTimeChart: title = dashboard_page_graph_title_{hour|day}). Assert
    // that observable effect — it's driven by UI state, so no fixture magic numbers.
    await page.getByText('קיבוץ לפי שעה').click()
    await expect(page.getByText('אחוזי יציאה מסך הנסיעות לפי שעה').first()).toBeVisible()
    await page.getByText('קיבוץ לפי יום').click()
    await expect(page.getByText('אחוזי יציאה מסך הנסיעות לפי יום').first()).toBeVisible()
  })
})
