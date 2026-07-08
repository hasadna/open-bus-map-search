import { expect, getPastDate, harOptions, setupTest, test } from './utils'

const TOOLTIP_CONTENT_ITEMS = [
  'שם חברה מפעילה:',
  'מוצא:',
  'יעד:',
  'מהירות:',
  'זמן דגימה:',
  'לוחית רישוי:',
  'כיוון נסיעה:',
  'נ.צ.:',
]

async function setupRealtimeMapFixture(
  page: Parameters<typeof setupTest>[0],
  advancedRouteFromHAR: (har: string, options: typeof harOptions) => Promise<void>,
) {
  await setupTest(page)
  await page.clock.setSystemTime(getPastDate())
  await advancedRouteFromHAR('tests/HAR/realtimemap.har', harOptions)
  await page.goto('/map?datetime=2023-03-14T17:00')
  await page.locator('.preloader').waitFor({ state: 'hidden' })
}

test('tooltip appears after clicking on map point', async ({ page, advancedRouteFromHAR }) => {
  await setupRealtimeMapFixture(page, advancedRouteFromHAR)

  await test.step('Click on a bus button', async () => {
    const button = page.getByRole('button', { name: 'אגד אגד' })
    await button.click()
    await button.click({ force: true })
  })

  await test.step('Click inside the tooltip', async () => {
    await page.getByRole('button', { name: 'הצג מידע לגיקים' }).click()
    await page.getByRole('button', { name: 'הסתר מידע לגיקים' }).click()
  })

  await test.step('Expecting the tooltip to have the correct content', async () => {
    const textList = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.content ul li'))
        .map((li) =>
          Array.from(li.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim() || ''),
        )
        .flat()
        .filter((value) => value !== '')
    })
    expect(textList).toEqual(TOOLTIP_CONTENT_ITEMS)
  })
})

test('uses current Israel time by default when no datetime is provided', async ({ page }) => {
  await setupTest(page)
  await page.route(/siri_vehicle_locations\/list/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  )
  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('siri_vehicle_locations/list'),
  )

  await page.goto('/map')
  const request = await requestPromise
  const params = new URL(request.url()).searchParams

  expect(params.get('recorded_at_time_from')).toBe('2024-02-12T15:00:00.000Z')
  expect(params.get('recorded_at_time_to')).toBe('2024-02-12T15:01:00.000Z')
})
