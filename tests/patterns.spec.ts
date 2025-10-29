import dayjs from 'src/dayjs'
import { expect, getPastDate, test, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await page.clock.setSystemTime(getPastDate())
  advancedRouteFromHAR('tests/HAR/patterns.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'fallback',
    url: /stride-api/,
    matcher: urlMatcher,
  })
})

test('verify API call to gtfs_agencies/list - "Patterns"', async ({ page }) => {
  let apiCallMade = false
  page.on('request', (request) => {
    if (request.url().includes('gtfs_agencies/list')) {
      apiCallMade = true
    }
  })

  await page.goto('/')
  await page.getByRole('link', { name: 'דפוסי נסיעות שלא בוצעו' }).click()
  await page.getByLabel('חברה מפעילה').click()
  expect(apiCallMade).toBeTruthy()
})

test('Verify date_from parameter from "Patterns"', async ({ page }) => {
  const apiRequest = page.waitForRequest((request) => request.url().includes('gtfs_agencies/list'))

  await page.goto('/')
  await page.getByRole('link', { name: 'דפוסי נסיעות שלא בוצעו' }).click()

  const request = await apiRequest
  const url = new URL(request.url())
  const dateFromParam = url.searchParams.get('date_from')
  const dateFrom = dayjs(dateFromParam)
  const daysAgo = dayjs().diff(dateFrom, 'days')

  expect(daysAgo).toBeGreaterThanOrEqual(0)
  expect(daysAgo).toBeLessThanOrEqual(3)
})
