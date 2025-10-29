import { expect, getPastDate, test, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await page.clock.setSystemTime(getPastDate())
  advancedRouteFromHAR('tests/HAR/research.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'fallback',
    url: /stride-api/,
    matcher: urlMatcher,
  })
  await page.goto('/')
})

test('research page opens with an easter egg', async ({ page }) => {
  await page.waitForLoadState('networkidle')
  await page.keyboard.type('geek')
  await page.locator('.body').click()
  await expect(page).toHaveURL('http://localhost:3000/data-research')
})
