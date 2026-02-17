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

test('the "Open Bus Stride API" link should point to the correct URL', async ({ page }) => {
  // Verify the href attribute instead of navigating to the stride-api domain,
  // since that domain may be blocked in CI environments.
  const link = page.getByRole('link', { name: 'Open Bus Stride API' }).first()
  await expect(link).toHaveAttribute('href', 'https://open-bus-stride-api.hasadna.org.il/docs')
})
