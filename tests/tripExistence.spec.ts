import { test } from './utils'

test('choosing params in "קיום נסיעות" and organize by date/hour ', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'קיום נסיעות' }).click()
  await page.getByLabel('התחלה').click()
  await page.getByLabel('התחלה').fill('02/6/2024')
  await page.getByLabel('סיום').click()
  await page.getByLabel('סיום').fill('02/6/2024')
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('option', { name: 'דן', exact: true }).click()
  await page.getByText('קיבוץ לפי שעה').click()
  await page.getByText('קיבוץ לפי יום').click()
})
