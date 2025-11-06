import { expect, harOptions, setupTest, test, visitPage, waitForSkeletonsToHide } from './utils'

const TRIP_EXISTENCE_ITEMS = [
  'קיום נסיעות',
  'הקווים הגרועים ביותר',
  'אחוזי יציאה מסך הנסיעות לפי יום',
]

test.describe('dashboard tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/dashboard.har', harOptions)
    await visitPage(page, 'dashboard_page_title')
    await page.getByText('הקווים הגרועים ביותר').waitFor()
    await waitForSkeletonsToHide(page)
  })

  test('dark mode use localstorage', async ({ page }) => {
    await page.getByLabel('עבור למצב כהה').click()
    await page.reload()
    await page.getByLabel('עבור למצב בהיר').click()
    await page.reload()
    await page.getByLabel('עבור למצב כהה').click()
  })

  test('dashboard charts contain information', async ({ page }) => {
    await expect(page.getByText('686 | קווים').first()).toBeVisible()
    await expect(page.getByText('מועצה אזורית גולן').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'אגד', exact: true })).toBeVisible()
  })

  test('Trip Existence page items', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(TRIP_EXISTENCE_ITEMS)
  })

  test('choosing params in "קיום נסיעות" and organize by date/hour ', async ({ page }) => {
    await page.getByLabel('התחלה').click()
    await page.getByLabel('התחלה').fill('02/6/2024')
    await page.getByLabel('סיום').click()
    await page.getByLabel('סיום').fill('02/6/2024')
    await page.getByLabel('חברה מפעילה').click()
    await page.getByRole('option', { name: 'דן', exact: true }).click()
    await page.getByText('קיבוץ לפי שעה').click()
    await page.getByText('קיבוץ לפי יום').click()
  })
})
