import { test, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  advancedRouteFromHAR('tests/HAR/realtimemap.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'abort',
    url: /stride-api/,
    matcher: urlMatcher,
  })
  await page.goto('/')
})
test('time-based-map page', async ({ page }) => {
  await page.getByText('מפה לפי זמן', { exact: true }).and(page.getByRole('link')).click()
  await page.waitForURL(/map/)
  await page.getByRole('progressbar').waitFor({ state: 'hidden' })
  await page.getByLabel('תאריך').fill(new Date().toLocaleDateString('en-GB'))
  await page.getByLabel('דקות').fill('6')
})
