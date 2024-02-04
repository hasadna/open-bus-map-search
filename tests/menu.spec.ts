import { test, expect } from './utils'

test('menu', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('דאטאבוס')
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
