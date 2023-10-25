import { test, expect } from '@playwright/test'

test('menu', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('דאטאבוס')
  const menuItemsInOrder = [
    'מפעילי תח"צ לפי קיום נסיעות מתוכננות',
    'לוח זמנים היסטורי',
    'נסיעות שלא יצאו',
    'דפוסי נסיעות שלא יצאו',
    'מפה בזמן אמת',
    'מפה לפי קו',
    'אודות',
    'דיווח על באג',
    'לתרומות',
  ]
  await expect(page.locator('ul > li')).toContainText(menuItemsInOrder)
})
