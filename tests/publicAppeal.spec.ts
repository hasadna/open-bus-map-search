import { expect, setupTest, test, visitPage } from './utils'

const PUBLIC_APPEAL_ITEMS = [
  'איפה נדרשים נתיבי תעדוף לתחבורה ציבורית (נת"צים)?',
  'חישוב שעת היציאה מתחנת המוצא, ושעת ההגעה לתחנות השונות במסלול',
  'איך לשייך קווי אוטובוס לאזורים גיאוגרפיים?',
  'התקבצות אוטובוסים',
]

test.beforeEach(async ({ page }) => {
  await setupTest(page)
  await visitPage(page, 'public_appeal_title')
})

test('Public Appeal page items', async ({ page }) => {
  await expect(page.locator('h2')).toContainText(PUBLIC_APPEAL_ITEMS)
})

test('clicking "Open Bus Stride API" link should lead to "https://open-bus-stride-api.hasadna.org.il/docs"', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Open Bus Stride API' }).first().click()
  await page.getByRole('heading', { name: 'Open Bus Stride API' }).waitFor()
  await expect(page).toHaveURL(/open-bus-stride-api\.hasadna\.org\.il/)
})
