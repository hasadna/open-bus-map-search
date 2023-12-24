import { test } from '@playwright/test'
test('realtime-map page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('מפה בזמן אמת', { exact: true }).click()
  await page.waitForURL(/map/)
  await page.getByRole('progressbar').waitFor({ state: 'hidden' })
  await page.getByLabel('בחירת תאריך').nth(1).waitFor({ state: 'detached' })
  await page.getByLabel('בחירת תאריך').click()
  await page.getByRole('gridcell', { name: '1', exact: true }).click()
  await page.getByLabel('דקות').fill('6')
})
