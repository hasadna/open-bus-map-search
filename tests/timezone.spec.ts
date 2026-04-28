import i18next from 'i18next'
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
]

const SINGLE_LINE_ROUTES = [
  'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו',
  'תחנת מוניות תל אביב הכובשים-תל אביב יפו ⟵ תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו',
]

const SINGLE_LINE_VEHICLE_NUMBER = '7489226'
const SINGLE_LINE_VEHICLE_START_TIME =
  '04:30 (16 - תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⇄ תחנת מוניות תל אביב הכובשים-תל אביב יפו)'

const SINGLE_LINE_VEHICLE_LOCATIONS = [
  {
    id: 3363674430,
    recorded_at_time: '2024-02-12T02:30:47+00:00',
    lon: 34.806637,
    lat: 32.045582,
    bearing: 282,
    velocity: 0,
    siri_route__line_ref: 28099,
    siri_route__operator_ref: 97,
    siri_ride__scheduled_start_time: '2024-02-12T02:30:00+00:00',
    siri_ride__vehicle_ref: SINGLE_LINE_VEHICLE_NUMBER,
  },
]

for (const timezone of TIMEZONES) {
  test.describe(`Timezone: ${timezone}`, () => {
    test.use({ timezoneId: timezone })

    test(`gaps page renders correctly (${timezone})`, async ({ page }) => {
      await setupTest(page)
      await visitPage(page, 'gaps_page_title')
      await expect(page.locator('h4')).toContainText(i18next.t('gaps_page_title'))
    })

    test(`timeline page renders correctly (${timezone})`, async ({ page }) => {
      await setupTest(page)
      await visitPage(page, 'timeline_page_title')
      await expect(page.locator('h4')).toContainText(i18next.t('timeline_page_title'))
    })

    test(`single line route selector uses Israel timezone (${timezone})`, async ({
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

    test(`single line start time list uses Israel timezone (${timezone})`, async ({
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
      await page
        .getByRole('option', {
          name: 'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו',
        })
        .click()

      await page.getByLabel('בחירת שעת התחלה').click()
      await expect(page.getByRole('option', { name: SINGLE_LINE_START_TIMES[0] })).toBeVisible()

      await expect(page.getByRole('option')).toContainText(SINGLE_LINE_START_TIMES)
    })

    test(`single line vehicle number start time list uses Israel timezone (${timezone})`, async ({
      page,
      advancedRouteFromHAR,
    }) => {
      await setupTest(page)
      await advancedRouteFromHAR('tests/HAR/singleline.har', harOptions)
      await page.route(/siri_vehicle_locations\/list/, async (route) => {
        await route.fulfill({ json: SINGLE_LINE_VEHICLE_LOCATIONS })
      })
      await visitPage(page, 'singleline_map_page_title')

      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true }).click()
      await page.getByRole('button', { name: 'לפי מספר רכב' }).click()
      await page.getByRole('textbox', { name: 'מספר רכב' }).fill(SINGLE_LINE_VEHICLE_NUMBER)

      await page.getByLabel('בחירת שעת התחלה').click()
      await expect(page.getByRole('option', { name: SINGLE_LINE_VEHICLE_START_TIME })).toBeVisible()
    })
  })
}
