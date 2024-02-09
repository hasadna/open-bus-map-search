import { test, expect, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  advancedRouteFromHAR('tests/HAR/menu.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'abort',
    url: /stride-api/,
    matcher: urlMatcher(),
  })
  await page.goto('/')
})

test('menu', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('דאטאבוס')
  const menuItemsInOrder = [
    'קיום נסיעות',
    'לוח זמנים היסטורי',
    'נסיעות שלא יצאו',
    'דפוסי נסיעות שלא יצאו',
    'מפה בזמן אמת',
    'מפה לפי קו',
    'אודות',
    'לתרומות',
  ]
  await expect(page.locator('ul > li a')).toContainText(menuItemsInOrder)
})
