import { test } from './utils'

test('about page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('אודות').click()
  await page.getByRole('link', { name: 'תרומות קטנות נוספות' }).click()
  await page.getByRole('heading', { name: 'הסדנא לידע ציבורי פותחת ומנגישה מידע' }).waitFor()
})
