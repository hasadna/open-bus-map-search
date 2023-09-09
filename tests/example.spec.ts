import { test } from '@playwright/test'

test('search bus station', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard')
  await page.getByRole('list').getByText('לוח זמנים היסטורי').click()
  await page.locator('#rc_select_1').fill('אג')
  await page.getByText('אגד', { exact: true }).click()
  await page.getByPlaceholder('לדוגמא: 17א').fill('10')
  await page.locator('div').filter({ hasText: 'בחירת מסלול נסיעה' }).nth(1).click()
  await page.locator('#rc_select_3').click()
  await page.getByText('חסן שוקרי/הנביאים-חיפה ⟵ חסן שוקרי/הנביאים-חיפה').click()
})
