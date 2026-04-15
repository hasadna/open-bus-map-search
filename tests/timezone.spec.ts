import { expect, setupTest, test, visitPage } from './utils'

const TIMEZONES = ['Asia/Jerusalem', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] as const

for (const timezone of TIMEZONES) {
  test.describe(`Timezone: ${timezone}`, () => {
    test.use({ timezoneId: timezone })

    test(`gaps page sends correct date to API (${timezone})`, async ({ page }) => {
      await setupTest(page)

      const apiRequests: string[] = []
      await page.route(/stride-api/, (route) => {
        apiRequests.push(route.request().url())
        return route.abort()
      })

      await visitPage(page, 'gaps_page_title')
      await page.getByLabel(/חברה מפעילה/).click()
      await page.waitForTimeout(2000)

      for (const url of apiRequests) {
        const urlObj = new URL(url)
        const dateFrom = urlObj.searchParams.get('date_from')
        if (dateFrom) {
          expect(dateFrom).toContain('2024-02-12')
        }
      }
    })
  })
}
