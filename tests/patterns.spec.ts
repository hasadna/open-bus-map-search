import {
  setupTest,
  test,
  urlMatcher,
  verifyAgenciesApiCall,
  verifyDateFromParameter,
  visitPage,
} from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await advancedRouteFromHAR('tests/HAR/patterns.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'fallback',
    url: /stride-api/,
    matcher: urlMatcher,
  })

  await visitPage(page, 'דפוסי נסיעות שלא בוצעו', /gaps_patterns/)
})

test('verify API call to gtfs_agencies/list - "Patterns"', async ({ page }) => {
  await verifyAgenciesApiCall(page)
})

test('Verify date_from parameter from "Patterns"', async ({ page }) => {
  await verifyDateFromParameter(page)
})
