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
    'ביצועי תחבורה ציבורית',
    'היסטוריית נסיעות',
    'נסיעות שלא בוצעו',
    'דפוסי נסיעות שלא בוצעו',
    'מפת אוטובוסים בזמן אמת',
    'מפה לפי קו',
    'אודות',
    'לתרומות',
  ]
  await expect(page.locator('ul > li a')).toContainText(menuItemsInOrder)
})
