import { test } from './utils'

test('single line', async ({ page }) => {
  await page.route('**stride-api**', (route) => route.abort())
  await page.route('*.png', (route) => route.abort())
  await page.goto('/')
  await page.getByText('מפה לפי קו').click()
  await page.getByPlaceholder('לדוגמא: 17א').fill('1')
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('option', { name: 'אגד', exact: true }).click()
})
