import { expect, test } from '@playwright/test'

test('"קול קורא" menu item should redirect to the public appeal page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('קול קורא').click()
  await expect(page).toHaveURL(/public-appeal/)
})

test('Public Appeal page items', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'קול קורא' }).click()
  const itemsInOrder = [
    'איפה נדרשים נתיבי תעדוף לתחבורה ציבורית (נת"צים)?',
    'חישוב שעת היציאה מתחנת המוצא, ושעת ההגעה לתחנות השונות במסלול',
    'איך לשייך קווי אוטובוס לאזורים גיאוגרפיים?',
    'התקבצות אוטובוסים',
  ]
  await expect(page.locator('h2')).toContainText(itemsInOrder)
})

test('clicking "Open Bus Stride API" link should lead to "https://open-bus-stride-api.hasadna.org.il/docs"', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByText('קול קורא').click()
  await page.getByRole('link', { name: 'Open Bus Stride API' }).first().click()
  await page.getByRole('heading', { name: 'Open Bus Stride API' }).waitFor()
  await expect(page).toHaveURL(/open-bus-stride-api\.hasadna\.org\.il/)
})
