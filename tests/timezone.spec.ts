import { expect, harOptions, setupTest, test, visitPage } from './utils'

const TIMEZONES = ['Asia/Jerusalem', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] as const

const SINGLE_LINE_START_TIMES = [
  '04:30 (74-892-26)',
  '04:47 (61-265-26)',
  '05:00 (74-891-26)',
  '05:23 (74-899-26)',
  '05:33 (60-860-26)',
  '05:44 (74-893-26)',
  '05:54 (74-895-26)',
] as const

const SINGLE_LINE_ROUTES = [
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו',
  'תחנת מוניות תל אביב הכובשים-תל אביב יפו ⟵ תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו',
] as const

const GAPS_ROUTE =
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
const GAPS_TIMES = ['04:30'] as const

const TIMELINE_ROUTE = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
const TIMELINE_STATION = 'חיים הרצוג/שדרות מנחם בגין (גדרה)'
const TIMELINE_TIMES = ['13:00:59', '13:01:25', '20:20:59', '20:55:01'] as const

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

    test(`timeline page timestamp graph uses Israel timezone (${timezone})`, async ({
      page,
      advancedRouteFromHAR,
    }) => {
      await setupTest(page)
      await advancedRouteFromHAR('tests/HAR/timeline.har', harOptions)
      await visitPage(page, 'timeline_page_title')

      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'אגד', exact: true }).click()
      await page.getByRole('textbox', { name: 'מספר קו' }).fill('1')
      await expect(page.locator('#route-select')).toBeEnabled()
      await page.getByLabel(/בחירת מסלול נסיעה/).click()
      await page.getByRole('option', { name: TIMELINE_ROUTE, exact: true }).click()
      await expect(page.locator('#stop-select')).toBeEnabled()
      await page.getByLabel(/בחירת תחנה/).click()
      await page.getByRole('option', { name: TIMELINE_STATION }).click()
      await page.locator('.MuiCircularProgress-svg').waitFor({ state: 'hidden' })
      await page.waitForLoadState('networkidle')

      const timelineHourLabels = page.getByText(/^\d{2}:\d{2}:\d{2}$/)
      for (const time of TIMELINE_TIMES) {
        await expect(page.getByText(time, { exact: true })).toBeVisible()
      }
      expect(await timelineHourLabels.count()).toBe(49)
    })
  })
}
