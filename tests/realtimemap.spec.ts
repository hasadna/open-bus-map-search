import { test } from '@playwright/test'

test('realtime-map page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('מפה בזמן אמת').click()
  await page.getByLabel('בחירת תאריך, התאריך שנבחר הוא').click()
  await page.getByRole('gridcell', { name: '1', exact: true }).click()
  await page.getByLabel('דקות').fill('6')
})
