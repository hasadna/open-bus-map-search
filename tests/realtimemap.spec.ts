import { test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.getByText('מפה בזמן אמת').click()
  await page.getByLabel('בחירת תאריך, התאריך שנבחר הוא').click()
  await page.getByRole('gridcell', { name: '1', exact: true }).click()
  await page.getByLabel('דקות').fill('6')
  await page.getByLabel('דקות').press('Enter')
})
