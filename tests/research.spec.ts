import { expect, setupTest, test, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await advancedRouteFromHAR('tests/HAR/research.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'fallback',
    url: /stride-api/,
    matcher: urlMatcher,
  })
})

test('research page opens with an easter egg', async ({ page }) => {
  await page.keyboard.type('geek')
  await page.locator('.body').waitFor({ state: 'visible' })
  await page.locator('.body').click({ force: true })
  await expect(page).toHaveURL(/data-research/)
  const title = page.locator('h2', { hasText: 'מחקרים' })
  await expect(title).toBeVisible()
})
