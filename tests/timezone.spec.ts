import i18next from 'i18next'
import { expect, setupTest, test, visitPage } from './utils'

const TIMEZONES = ['Asia/Jerusalem', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] as const

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
  })
}
