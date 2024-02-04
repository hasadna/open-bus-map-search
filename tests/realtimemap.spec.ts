import { test } from './utils'

test('realtime-map page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('מפת אוטובוסים בזמן אמת', { exact: true }).click()
  await page.waitForURL(/map/)
  await page.getByRole('progressbar').waitFor({ state: 'hidden' })
  await page.getByLabel('תאריך').fill(new Date().toLocaleDateString('en-GB'))
  await page.getByLabel('דקות').fill('6')
})
