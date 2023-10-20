import { Page } from '@playwright/test'
import { test } from './utils'

test('search bus station', async ({ page }) => {
  test.slow()
  await page.routeFromHAR('tests/example.har', {
    url: /^(?!.*\.(ts|js|mjs)$).*api/,
    update: false,
    updateContent: 'embed',
    notFound: 'abort',
  })
  await mockAPI(page)
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
    .locator('#operator-select')
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

// this function makes sure that the API is mocked using the HAR file
async function mockAPI(page: Page) {
  await page.route(/siri_vehicle_locations\/list/, (route) => {
    console.log('mocking siri_vehicle_locations/list')
    route.fallback({
      url: 'https://open-bus-stride-api.hasadna.org.il/siri_vehicle_locations/list?limit=1024&recorded_at_time_from=2023-09-05T04%3A18%3A00.000Z&recorded_at_time_to=2023-09-05T08%3A18%3A00.000Z&lon__greater_or_equal=34.992476634299&lon__lower_or_equal=35.003177365701006&lat__greater_or_equal=32.8099453919704&lat__lower_or_equal=32.81893860802958&order_by=distance_from_siri_ride_stop_meters%20desc&siri_routes__ids=609',
    })
  })
  await page.route(/gtfs_rides\/list/, (route) => {
    console.log('mocking gtfs_rides/list')
    route.fallback({
      url: 'https://open-bus-stride-api.hasadna.org.il/gtfs_rides/list?limit=1&gtfs_route_id=3457449&start_time_from=2023-09-04T06%3A18%3A00.000Z&start_time_to=2023-09-06T06%3A18%3A00.000Z&order_by=start_time',
    })
  })
  await page.route(/siri_rides\/list/, (route) => {
    console.log('mocking siri_rides/list')
    route.fallback({
      url: 'https://open-bus-stride-api.hasadna.org.il/siri_rides/list?limit=1&gtfs_route__date_from=2023-09-05&gtfs_route__date_to=2023-09-05&gtfs_route__operator_refs=3&gtfs_route__route_short_name=10&gtfs_route__route_direction=3&gtfs_ride__gtfs_route_id=3457449&gtfs_ride__start_time_from=2023-09-04T06%3A18%3A00.000Z&gtfs_ride__start_time_to=2023-09-06T06%3A18%3A00.000Z&scheduled_start_time_from=2023-09-04T06%3A18%3A00.000Z&scheduled_start_time_to=2023-09-06T06%3A18%3A00.000Z',
    })
  })
  await page.route(/siri_vehicle_locations\/list/, (route) => {
    console.log('mocking siri_vehicle_locations/list')
    route.fallback({
      url: 'https://open-bus-stride-api.hasadna.org.il/siri_vehicle_locations/list?limit=1024&recorded_at_time_from=2023-09-05T04%3A18%3A00.000Z&recorded_at_time_to=2023-09-05T08%3A18%3A00.000Z&lon__greater_or_equal=34.992476634299&lon__lower_or_equal=35.003177365701006&lat__greater_or_equal=32.8099453919704&lat__lower_or_equal=32.81893860802958&order_by=distance_from_siri_ride_stop_meters%20desc&siri_routes__ids=609',
    })
  })
  await page.route(/gtfs_ride_stops\/list/, (route) => {
    console.log('mocking gtfs_ride_stops/list')
    route.fallback({
      url: 'https://open-bus-stride-api.hasadna.org.il/gtfs_ride_stops/list?gtfs_stop_ids=16771761&gtfs_ride_ids=52603978%2C52553909%2C52603977%2C52536914%2C52536913%2C52603979%2C52526687%2C52603980%2C52526688%2C52526686%2C52557660',
    })
  })
}
