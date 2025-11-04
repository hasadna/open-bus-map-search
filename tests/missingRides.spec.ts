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
  await advancedRouteFromHAR('tests/HAR/missing.har', harOptions)
  visitPage(page, 'נסיעות שלא בוצעו', /gaps/)
})

test('verify API call to gtfs_agencies/list - "missing rides"', async ({ page }) => {
  await verifyAgenciesApiCall(page)
})

test('Verify date_from parameter from "missing rides"', async ({ page }) => {
  await verifyDateFromParameter(page)
})
