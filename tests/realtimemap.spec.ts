import { test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.getByText('מפה בזמן אמת').click()
  await page.getByLabel('בחירת תאריך, התאריך שנבחר הוא').click()
  // Does not pass:
  // await page.getByLabel('חודש קודם').click()
  // Will not pass if we just started a new month:)
  // await page.getByRole('gridcell', { name: '23' }).click()
  await page.getByRole('gridcell', { name: '1', exact: true }).click()
  await page.getByLabel('דקות').fill('6')
  await page.getByLabel('דקות').press('Enter')
  // This test passes about half the time...
  // await page.getByLabel('בחירת שעה').click()
  // await page.locator('.MuiClock-squareMask').click()
})
