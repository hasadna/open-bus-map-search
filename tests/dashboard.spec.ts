import { test } from '@playwright/test'

test('dashboard is on homepage', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000')
  await page.getByText('קיבוץ לפי שעה').click()
})
