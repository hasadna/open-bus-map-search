import { expect, setupTest, test, visitPage } from './utils'

const TIMEZONES = ['Asia/Jerusalem', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] as const

// The fixed past date used in tests is 2024-02-12T15:00:00+00:00
// In Israel timezone (UTC+2), this is 2024-02-12 17:00
// The date selector should show 12/02/2024 regardless of the browser timezone
const EXPECTED_DATE = '12/02/2024'

for (const timezone of TIMEZONES) {
  test.describe(`Timezone: ${timezone}`, () => {
    test.use({ timezoneId: timezone })

    test(`gaps page shows consistent date in selector (${timezone})`, async ({ page }) => {
      await setupTest(page)
      await visitPage(page, 'gaps_page_title')

      const dateInput = page.locator('input[type="text"]').first()
      await expect(dateInput).toBeVisible()
      const dateValue = await dateInput.inputValue()
      expect(dateValue).toBe(EXPECTED_DATE)
    })

    test(`timeline page shows consistent date in selector (${timezone})`, async ({ page }) => {
      await setupTest(page)
      await visitPage(page, 'timeline_page_title')

      const dateInput = page.locator('input[type="text"]').first()
      await expect(dateInput).toBeVisible()
      const dateValue = await dateInput.inputValue()
      expect(dateValue).toBe(EXPECTED_DATE)
    })
  })
}
