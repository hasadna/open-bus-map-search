import { expect, harOptions, setupTest, test, visitPage } from './utils'

const TIMEZONES = ['Asia/Jerusalem', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] as const

const SINGLE_LINE_START_TIMES = ['04:30 (74-892-26)'] as const

const SINGLE_LINE_ROUTES = [
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו',
  'תחנת מוניות תל אביב הכובשים-תל אביב יפו ⟵ תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו',
] as const

const GAPS_ROUTE =
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
const GAPS_TIMES = ['04:30'] as const
const VEHICLE_NUMBER = '7489226'
const VEHICLE_START_TIME = /^04:30\b/

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
      await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
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
      await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
      await page.getByLabel(/בחירת מסלול נסיעה/).click()
      await page.getByRole('option', { name: SINGLE_LINE_ROUTES[0] }).click()

      await page.getByLabel('בחירת שעת התחלה').click()
      await expect(page.getByRole('option', { name: SINGLE_LINE_START_TIMES[0] })).toBeVisible()

      await expect(page.getByRole('option')).toContainText(SINGLE_LINE_START_TIMES)
    })

    test(`single line map page vehicle number start time uses Israel timezone (${timezone})`, async ({
      page,
      advancedRouteFromHAR,
    }) => {
      await setupTest(page)
      await advancedRouteFromHAR('tests/HAR/singleline.har', harOptions)
      await visitPage(page, 'singleline_map_page_title')

      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true }).click()
      await page.getByRole('button', { name: 'לפי מספר רכב' }).click()
      await page.getByRole('textbox', { name: 'מספר רכב' }).fill(VEHICLE_NUMBER)

      await expect(page.locator('#start-time-select')).toBeEditable({ timeout: 10000 })
      await page.getByLabel('בחירת שעת התחלה').click()

      await expect(page.getByRole('option', { name: VEHICLE_START_TIME })).toBeVisible()
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
      await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
      await page.getByLabel(/בחירת מסלול נסיעה/).click()
      await expect(page.getByRole('option')).toContainText([GAPS_ROUTE])
      await page.getByRole('option', { name: GAPS_ROUTE }).click()

      await expect(page.getByRole('cell')).toContainText(GAPS_TIMES)
    })
  })
}
