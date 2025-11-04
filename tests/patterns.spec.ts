import {
  harOptions,
  setupTest,
  test,
  verifyAgenciesApiCall,
  verifyDateFromParameter,
  visitPage,
} from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await advancedRouteFromHAR('tests/HAR/patterns.har', harOptions)
  await visitPage(page, 'דפוסי נסיעות שלא בוצעו', /gaps_patterns/)
})

test('Verify API call to gtfs_agencies/list - "Patterns"', async ({ page }) => {
  await verifyAgenciesApiCall(page)
})

test('Verify date_from parameter from - "Patterns"', async ({ page }) => {
  await verifyDateFromParameter(page)
})
