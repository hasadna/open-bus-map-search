import {
  expect,
  fillDateField,
  harOptions,
  setupTest,
  test,
  visitPage,
  waitForSkeletonsToHide,
} from './utils'

// The default range is the week before getPastDate(); only one of its days is published here.
const KAV_BOCHAN_INDEX = {
  days: [
    { d: '2024-02-01', o: [5, 990, 3, 1, 1] },
    { d: '2024-02-08', o: [12, 980, 5, 2, 1] },
    { d: '2024-02-20', o: [7, 990, 2, 1, 0] },
  ],
}

const TRIP_EXISTENCE_ITEMS = [
  'קיום נסיעות',
  'הקווים הגרועים ביותר',
  'אחוזי יציאה מסך הנסיעות לפי יום',
]

test.describe('dashboard tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/dashboard.har', harOptions)
    await page.route(/kavbochan\.app\/bus\/data\/index\.json/, (route) =>
      route.fulfill({ json: KAV_BOCHAN_INDEX }),
    )
    await visitPage(page, 'dashboard_page_title')
    await page.getByText('הקווים הגרועים ביותר').waitFor()
    await waitForSkeletonsToHide(page)
  })

  test('dashboard charts contain information', async ({ page }) => {
    await expect(page.getByText('686 | קווים').first()).toBeVisible()
    await expect(page.getByText('מועצה אזורית גולן').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'אגד', exact: true })).toBeVisible()
  })

  test('Trip Existence page items', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(TRIP_EXISTENCE_ITEMS)
  })

  test('early departures card sums the published days of the range', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'יציאה מוקדמת מתחנת המוצא' })).toBeVisible()
    await expect(page.getByText('12 מתוך 1,000 יציאות שנמדדו (1.2%) יצאו מוקדם')).toBeVisible()
  })

  test('choosing params in "סיכום ביצועי נסיעות" and organize by date/hour ', async ({ page }) => {
    await fillDateField(page, 'התחלה', '02/6/2024')
    await fillDateField(page, 'סיום', '02/6/2024')
    await page.getByLabel('חברה מפעילה').click()
    await page.getByRole('option', { name: 'דן', exact: true }).click()

    // The group-by toggle swaps the chart title between its hour and day variants.
    await page.getByText('קיבוץ לפי שעה').click()
    await expect(page.getByText('אחוזי יציאה מסך הנסיעות לפי שעה').first()).toBeVisible()
    await page.getByText('קיבוץ לפי יום').click()
    await expect(page.getByText('אחוזי יציאה מסך הנסיעות לפי יום').first()).toBeVisible()
  })
})
