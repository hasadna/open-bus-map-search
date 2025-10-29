import { expect, test, urlMatcher } from './utils'

test.beforeEach(({ advancedRouteFromHAR }) => {
  advancedRouteFromHAR('tests/HAR/research.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'fallback',
    url: /stride-api/,
    matcher: urlMatcher,
  })
})

test('research page opens with an easter egg', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.waitForLoadState('networkidle')
  await page.keyboard.type('geek')
  await page.locator('.body').click()
  await expect(page).toHaveURL('http://localhost:3000/data-research')
})
