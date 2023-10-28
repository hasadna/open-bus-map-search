import { Page } from '@playwright/test'
import { test } from './utils'

test('search bus station', async ({ page, advancedRouteFromHAR }) => {
  test.slow()
  await advancedRouteFromHAR('tests/example.har', {
    url: /^(?!.*\.(ts|js|mjs)$).*api/,
    update: false,
    updateContent: 'embed',
    notFound: 'abort',
    matcher: (request, entry) => {
      const reqUrl = new URL(request.url())
      const entryUrl = new URL(entry.request.url)
      for (const param of [...reqUrl.searchParams.keys()]) {
        if (param.includes('time') || param.includes('date')) {
          reqUrl.searchParams.delete(param)
          entryUrl.searchParams.delete(param)
        }
      }
      if (reqUrl.searchParams.has('gtfs_ride_ids')) {
        reqUrl.searchParams.set(
          'gtfs_ride_ids',
          reqUrl.searchParams.get('gtfs_ride_ids')!.split(',').sort().join(','),
        )
      }
      if (entryUrl.searchParams.has('gtfs_ride_ids')) {
        entryUrl.searchParams.set(
          'gtfs_ride_ids',
          entryUrl.searchParams.get('gtfs_ride_ids')!.split(',').sort().join(','),
        )
      }
      const isSearchParamSame =
        [...reqUrl.searchParams.keys()].every((key) => {
          return reqUrl.searchParams.get(key) === entryUrl.searchParams.get(key)
        }) && reqUrl.searchParams.size === entryUrl.searchParams.size
      return reqUrl.pathname === entryUrl.pathname && isSearchParamSame ? 1 : -1
    },
  })
  // await mockAPI(page)
  await resetPage(page)

  await page.goto('/dashboard')
  await page.locator('li').filter({ hasText: 'לוח זמנים היסטורי' }).click()
  await page.getByLabel('בחירת תאריך').click()
  await page.getByPlaceholder(/DD.*MM.*YYYY/).fill('05/09/2023')
  await page.getByRole('gridcell', { name: '5', exact: true }).first().click()
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('combobox', { name: 'חברה מפעילה' }).fill('אג')
  await page.getByRole('option', { name: 'אגד', exact: true }).click()
  await page.getByPlaceholder('לדוגמא: 17א').click()
  await page.getByPlaceholder('לדוגמא: 17א').fill('10')
  await page
    .locator('div')
    .filter({ hasText: /^בחירת מסלול נסיעה/ })
    .locator('#route-select')
    .click()
  await page
    .getByRole('option', { name: 'חסן שוקרי/הנביאים-חיפה ⟵ חסן שוקרי/הנביאים-חיפה' })
    .click()
  await page.getByLabel('בחירת תחנה').click()
  await page.locator('#stop-select-option-0').click()
  await page.getByText('זמן עצירה מתוכנן 🕛').click({ timeout: 15 * 60 * 1000 })
})

function resetPage(page: Page) {
  return page.addInitScript(() => {
    const OriginalDate = window.Date

    class MockDate extends OriginalDate {
      static currentDate = '2023-09-05T12:00:00.000Z'
      static currentTimeStamp = new OriginalDate(MockDate.currentDate).getTime()
      static originalNow = OriginalDate.now()

      constructor(...args) {
        const params = args && args.length ? args : [MockDate.currentTimeStamp + MockDate.getTick()]

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super(...params)
      }

      static [Symbol.hasInstance](instance: Date) {
        return typeof instance?.getDate === 'function'
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
    window.addEventListener('load', () => {
      const style = document.createElement('style')
      document.head.appendChild(style)
      style.innerHTML = `
      #webpack-dev-server-client-overlay {
        display: none !important;
      }
    `
    })
  })
}
