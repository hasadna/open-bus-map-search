import { test, expect, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
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
    'קיום נסיעות',
    'היסטוריית נסיעות',
    'נסיעות שלא בוצעו',
    'דפוסי נסיעות שלא בוצעו',
    'מפה לפי זמן',
    'מפה לפי קו',
    'אודות',
  ]
  await expect(page.locator('ul > li a')).toContainText(menuItemsInOrder)
})
