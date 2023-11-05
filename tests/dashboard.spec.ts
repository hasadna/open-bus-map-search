import { test } from './utils'

test('dashboard is on homepage', async ({ page }) => {
  await page.goto('/')
  await page.getByText('לפי שעה').click()
})
