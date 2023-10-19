import { test } from '@playwright/test'

test('about page', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.getByText('אודות').click()
  await page.getByRole('link', { name: 'תרומות קטנות נוספות' }).click()
  await page.getByRole('heading', { name: 'הסדנא לידע ציבורי פותחת ומנגישה מידע' }).waitFor()
})
