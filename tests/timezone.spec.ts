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
  })
}
