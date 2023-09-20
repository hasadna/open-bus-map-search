import { test } from '@playwright/test'

test('search bus station', async ({ page }) => {
  await page.routeFromHAR('tests/example.har', {
    url: /api/,
    update: false,
    updateContent: 'embed',
    notFound: 'fallback',
  })

  await resetTime(page)

  await page.goto('/dashboard')
  await page.locator('li').filter({ hasText: 'לוח זמנים היסטורי' }).click()
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('combobox', { name: 'חברה מפעילה' }).fill('אג')
  await page.getByRole('option', { name: 'אגד', exact: true }).click()
  await page.getByPlaceholder('לדוגמא: 17א').click()
  await page.getByPlaceholder('לדוגמא: 17א').fill('10')
  await page
    .locator('div')
    .filter({ hasText: /^בחירת מסלול נסיעה/ })
    .locator('#operator-select')
    .click()
  await page
    .getByRole('option', { name: 'חסן שוקרי/הנביאים-חיפה ⟵ חסן שוקרי/הנביאים-חיפה' })
    .click()
  await page.getByLabel('בחירת תחנה (36 אפשרויות)').click()
  await page.locator('#stop-select-option-0').click()
  await page.getByText('זמני נסיעה בטעינה').click()
  await page.getByText('זמן עצירה מתוכנן 🕛').click({ timeout: 3 * 60 * 1000 })
})

function resetTime(page: Page) {
  return page.addInitScript(() => {
    page.evaluate(() => {
      const OriginalDate = window.Date

      class MockDate extends OriginalDate {
        static currentDate = '2023-09-09T12:00:00.000Z'
        static currentTimeStamp = new OriginalDate(MockDate.currentDate).getTime()
        static originalNow = OriginalDate.now()

        constructor(...args) {
          const params =
            args && args.length ? args : [MockDate.currentTimeStamp + MockDate.getTick()]

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          super(...params)
        }

        static [Symbol.hasInstance](instance: Date) {
          return typeof instance.getDate === 'function'
        }

        static getTick() {
          return OriginalDate.now() - MockDate.originalNow
        }

        static now() {
          return MockDate.currentTimeStamp + MockDate.getTick()
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.Date = MockDate
    })
  })
}
