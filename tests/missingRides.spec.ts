import { expect, harOptions, setupTest, test, verifyDateFromParameter, visitPage } from './utils'

const GAPS_OPERATOR = 'אודליה מוניות בעמ'
const GAPS_LINE_NUMBER = '16'
const GAPS_ROUTE =
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
const GAPS_LEGEND = [
  'יצאה כמתוכנן',
  'נסיעה חסרה',
  'נסיעה שלא תוכננה',
  'נסיעה כפולה',
  'נסיעה עתידית',
] as const
const GAPS_TIMES = ['04:30'] as const
const FULL_SERVICE_DAY_TIMES = ['04:30', '17:00', '04:47'] as const

async function selectGapsRoute(page: import('@playwright/test').Page) {
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('option', { name: GAPS_OPERATOR, exact: true }).click()
  await page.getByRole('textbox', { name: 'מספר קו' }).fill(GAPS_LINE_NUMBER)
  await page.getByLabel(/בחירת מסלול נסיעה/).click()
  await page.getByRole('option', { name: GAPS_ROUTE }).click()
}

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await advancedRouteFromHAR('tests/HAR/missing.har', harOptions)
  await visitPage(page, 'gaps_page_title')
})

test('should load gaps table for selected route', async ({ page }) => {
  await selectGapsRoute(page)

  for (const legend of GAPS_LEGEND) {
    await expect(page.getByText(legend)).toBeVisible()
  }
  for (const time of GAPS_TIMES) {
    await expect(page.getByRole('cell', { name: time }).first()).toBeVisible()
  }
})

test('should load rides for the full day plus 4 hours', async ({ page }) => {
  const gapsRequestPromise = page.waitForRequest((request) =>
    request.url().includes('/rides_execution/list'),
  )
  await selectGapsRoute(page)
  const gapsRequest = await gapsRequestPromise
  const gapsUrl = new URL(gapsRequest.url())

  expect(gapsUrl.searchParams.get('date_from')).toBe('2024-02-12') //should be the same day
  expect(gapsUrl.searchParams.get('date_to')).toBe('2024-02-13') //should be the next day (service-day)

  for (const time of FULL_SERVICE_DAY_TIMES) {
    await expect(page.getByRole('cell', { name: time }).first()).toBeVisible()
  }
})

test('should keep original missing rides percentage when showing only gaps', async ({ page }) => {
  await selectGapsRoute(page)

  const missingPercentage = page.getByText('כמעט / כל הנסיעות בוצעו')
  await expect(missingPercentage).toBeVisible()
  await page.getByLabel('רק פערים').click()
  await expect(page.getByRole('cell', { name: '10:30' })).not.toBeVisible()
  await expect(missingPercentage).toBeVisible()
  await expect(page.getByText('כמעט / כל הנסיעות בוצעו')).toBeVisible()
})

test('Verify date_from parameter from - "missing rides"', async ({ page }) => {
  await verifyDateFromParameter(page)
})
