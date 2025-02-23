import moment from 'moment'
import { test, expect, urlMatcher } from './utils'

test.describe('Trip Existence Page Tests', () => {
  test.beforeEach(({ advancedRouteFromHAR }) => {
    advancedRouteFromHAR('tests/HAR/tripExistence.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'abort',
      url: /stride-api/,
      matcher: urlMatcher,
    })
  })

  test('Trip Existence page items', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'קיום נסיעות' }).click()
    const itemsInOrder = ['קיום נסיעות', 'הקווים הגרועים ביותר', 'אחוזי יציאה מסך הנסיעות לפי יום']
    await expect(page.locator('h2')).toContainText(itemsInOrder)
  })

  test('choosing params in "קיום נסיעות" and organize by date/hour ', async ({ page }) => {
    await page.goto('/')
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
})

test('verify API call to gtfs_agencies/list - "Planned trips"', async ({ page }) => {
  let apiCallMade = false
  page.on('request', (request) => {
    if (request.url().includes('gtfs_agencies/list')) {
      apiCallMade = true
    }
  })

  await page.goto('/')
  await page.getByRole('link', { name: 'קיום נסיעות' }).click()
  await page.getByLabel('חברה מפעילה').click()
  expect(apiCallMade).toBeTruthy()
})

test('the dateFrom parameter should be recent when visiting the "Planned trips" tabs', async ({ page }) => {
  const apiRequest = page.waitForRequest((request) => request.url().includes('gtfs_agencies/list'))

  await page.goto('/')
  await page.getByRole('link', { name: 'קיום נסיעות' }).click()

  const request = await apiRequest
  const url = new URL(request.url())
  const dateFromParam = url.searchParams.get('date_from')
  const dateFrom = moment(dateFromParam)
  const daysAgo = moment().diff(dateFrom, 'days')

  expect(daysAgo).toBeGreaterThanOrEqual(0)
  expect(daysAgo).toBeLessThanOrEqual(3)
})
