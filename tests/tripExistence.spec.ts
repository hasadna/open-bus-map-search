import dayjs from 'src/dayjs'
import { expect, getPastDate, test, urlMatcher } from './utils'

test.describe('Trip Existence Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    await page.clock.setSystemTime(getPastDate())
    advancedRouteFromHAR('tests/HAR/tripExistence.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'fallback',
      url: /stride-api/,
      matcher: urlMatcher,
    })
    await page.goto('/')
  })

  test('Trip Existence page items', async ({ page }) => {
    await page.getByRole('link', { name: 'קיום נסיעות' }).click()
    const itemsInOrder = ['קיום נסיעות', 'הקווים הגרועים ביותר', 'אחוזי יציאה מסך הנסיעות לפי יום']
    await expect(page.locator('h2')).toContainText(itemsInOrder)
  })

  test('choosing params in "קיום נסיעות" and organize by date/hour ', async ({ page }) => {
    await page.getByRole('link', { name: 'קיום נסיעות' }).click()
    await page.getByLabel('התחלה').click()
    await page.getByLabel('התחלה').fill('02/6/2024')
    await page.getByLabel('סיום').click()
    await page.getByLabel('סיום').fill('02/6/2024')
    await page.getByLabel('חברה מפעילה').click()
    await page.getByRole('option', { name: 'דן', exact: true }).click()
    await page.getByText('קיבוץ לפי שעה').click()
    await page.getByText('קיבוץ לפי יום').click()
  })

  test('verify API call to gtfs_agencies/list - "Planned trips"', async ({ page }) => {
    let apiCallMade = false
    page.on('request', (request) => {
      if (request.url().includes('gtfs_agencies/list')) {
        apiCallMade = true
      }
    })

    await page.getByRole('link', { name: 'קיום נסיעות' }).click()
    await page.getByLabel('חברה מפעילה').click()
    expect(apiCallMade).toBeTruthy()
  })

  test('the dateFrom parameter should be recent when visiting the "Planned trips" tabs', async ({
    page,
  }) => {
    const apiRequest = page.waitForRequest((request) =>
      request.url().includes('gtfs_agencies/list'),
    )

    await page.getByRole('link', { name: 'קיום נסיעות' }).click()

    const request = await apiRequest
    const url = new URL(request.url())
    const dateFromParam = url.searchParams.get('date_from')
    const dateFrom = dayjs(dateFromParam)
    const daysAgo = dayjs(getPastDate()).diff(dateFrom, 'days')

    expect(daysAgo).toBeGreaterThanOrEqual(0)
    expect(daysAgo).toBeLessThanOrEqual(3)
  })
})
