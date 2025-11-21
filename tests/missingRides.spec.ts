import { harOptions, setupTest, test, verifyDateFromParameter, visitPage } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await advancedRouteFromHAR('tests/HAR/missing.har', harOptions)
  visitPage(page, 'gaps_page_title')
})

test('Verify date_from parameter from - "missing rides"', async ({ page }) => {
  await verifyDateFromParameter(page)
})
