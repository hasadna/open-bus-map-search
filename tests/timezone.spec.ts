import { expect, harOptions, setupTest, test, visitPage } from './utils'

const TIMEZONES = ['Asia/Jerusalem', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] as const

const SINGLE_LINE_START_TIMES = [
  '04:30',
  '04:47',
  '05:00',
  '05:23',
  '05:33',
  '05:44',
  '05:54',
] as const

const SINGLE_LINE_ROUTES = [
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו',
  'תחנת מוניות תל אביב הכובשים-תל אביב יפו ⟵ תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו',
] as const

const GAPS_ROUTE =
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
const GAPS_TIMES = ['04:30'] as const

for (const timezone of TIMEZONES) {
  test.describe(`Timezone: ${timezone}`, () => {
    test.use({ timezoneId: timezone })
    test(`single line map page route selector uses Israel timezone (${timezone})`, async ({
      page,
      advancedRouteFromHAR,
    }) => {
      await setupTest(page)
      await advancedRouteFromHAR('tests/HAR/singleline.har', harOptions)
      await visitPage(page, 'singleline_map_page_title')

      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true }).click()
      await page.getByRole('combobox', { name: 'מספר קו' }).fill('16')
      await page.getByLabel(/בחירת מסלול נסיעה/).click()

      await expect(page.getByRole('option')).toContainText(SINGLE_LINE_ROUTES)
    })

    test(`single line map page start time list uses Israel timezone (${timezone})`, async ({
      page,
      advancedRouteFromHAR,
    }) => {
      await setupTest(page)
      await advancedRouteFromHAR('tests/HAR/singleline.har', harOptions)
      await visitPage(page, 'singleline_map_page_title')

      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true }).click()
      await page.getByRole('combobox', { name: 'מספר קו' }).fill('16')
      await page.getByLabel(/בחירת מסלול נסיעה/).click()
      await page.getByRole('option', { name: SINGLE_LINE_ROUTES[0] }).click()

      await page.getByLabel('בחירת שעת התחלה').click()
      await expect(page.getByRole('option', { name: SINGLE_LINE_START_TIMES[0] })).toBeVisible()

      await expect(page.getByRole('option')).toContainText(SINGLE_LINE_START_TIMES)
    })

    test(`gaps page table uses Israel timezone (${timezone})`, async ({
      page,
      advancedRouteFromHAR,
    }) => {
      await setupTest(page)
      await advancedRouteFromHAR('tests/HAR/missing.har', harOptions)
      await visitPage(page, 'gaps_page_title')

      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true }).click()
      await page.getByRole('combobox', { name: 'מספר קו' }).fill('16')
      await page.getByLabel(/בחירת מסלול נסיעה/).click()
      await expect(page.getByRole('option')).toContainText([GAPS_ROUTE])
      await page.getByRole('option', { name: GAPS_ROUTE }).click()

      await expect(page.getByRole('cell')).toContainText(GAPS_TIMES)
    })
  })
}
