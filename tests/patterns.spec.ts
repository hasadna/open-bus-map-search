import { harOptions, setupTest, test, verifyDateFromParameter, visitPage } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await advancedRouteFromHAR('tests/HAR/patterns.har', harOptions)
  await visitPage(page, 'gaps_patterns_page_title')
})

test('Verify date_from parameter from - "Patterns"', async ({ page }) => {
  await verifyDateFromParameter(page)
})
