import { expect, test, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  advancedRouteFromHAR('tests/HAR/menu.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'abort',
    url: /stride-api/,
    matcher: urlMatcher,
  })
  await page.goto('/')
})

test('menu', async ({ page }) => {
  await expect(page.locator('h1.sidebar-logo')).toContainText('דאטאבוס')
  const menuItemsInOrder = [
    'ראשי',
    'קיום נסיעות',
    'היסטוריית נסיעות',
    'נסיעות שלא בוצעו',
    'דפוסי נסיעות שלא בוצעו',
    'מפה לפי זמן',
    'מפה לפי קו',
    'אודות',
    'לתרומות',
  ]
  await expect(page.locator('ul > li a')).toContainText(menuItemsInOrder)
})
