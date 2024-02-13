import { test, expect } from './utils'

test('menu', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1.sidebar-logo')).toContainText('דאטאבוס')
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
