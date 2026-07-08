import type { Page } from '@playwright/test'
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

const FILTER_TEST_LOCATIONS = [
  {
    id: 1,
    recorded_at_time: '2024-02-12T15:00:10+00:00',
    lon: 34.78,
    lat: 32.08,
    bearing: 90,
    velocity: 20,
    siri_ride__vehicle_ref: '1111111',
    siri_ride__scheduled_start_time: '2024-02-12T14:45:00+00:00',
    siri_route__line_ref: 1,
    siri_route__operator_ref: 3,
  },
  {
    id: 2,
    recorded_at_time: '2024-02-12T15:00:20+00:00',
    lon: 34.79,
    lat: 32.09,
    bearing: 180,
    velocity: 80,
    siri_ride__vehicle_ref: '2222222',
    siri_ride__scheduled_start_time: '2024-02-12T14:50:00+00:00',
    siri_route__line_ref: 2,
    siri_route__operator_ref: 2,
  },
  {
    id: 3,
    recorded_at_time: '2024-02-12T15:00:30+00:00',
    lon: 34.8,
    lat: 32.1,
    bearing: 270,
    velocity: 60,
    siri_ride__vehicle_ref: '3333333',
    siri_ride__scheduled_start_time: '2024-02-12T14:55:00+00:00',
    siri_route__line_ref: 3,
    siri_route__operator_ref: 5,
  },
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

async function setupFilterMapFixture(page: Page) {
  await setupTest(page)
  await page.route(/siri_vehicle_locations\/list/, (route) => {
    const offset = Number(new URL(route.request().url()).searchParams.get('offset') ?? 0)
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(offset === 0 ? FILTER_TEST_LOCATIONS : []),
    })
  })
  await page.goto('/map?datetime=2024-02-12T17:00')
  await expect(page.getByText('מוצגים 3 מתוך 3 מיקומים')).toBeVisible()
}

async function openFilters(page: Page) {
  await page.getByRole('button', { name: 'מסננים' }).click()
  await expect(page.getByRole('heading', { name: 'סינון' })).toBeVisible()
}

async function selectAutocompleteOption(page: Page, fieldName: RegExp, optionName: string) {
  await page.getByRole('combobox', { name: fieldName }).click()
  await page.getByRole('option', { name: optionName }).click()
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

test('uses the stable Pi Day 2023 snapshot by default when no datetime is provided', async ({
  page,
}) => {
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

  expect(params.get('recorded_at_time_from')).toBe('2023-03-14T15:00:00.000Z')
  expect(params.get('recorded_at_time_to')).toBe('2023-03-14T15:01:00.000Z')
})

test('filters map locations by service type and operator', async ({ page }) => {
  await setupFilterMapFixture(page)
  await openFilters(page)

  await selectAutocompleteOption(page, /סוג שירות/, 'רכבת')
  await expect(page.getByText('מוצגים 1 מתוך 3 מיקומים')).toBeVisible()

  await page.getByRole('button', { name: 'ניקוי מסננים' }).click()
  await expect(page.getByText('מוצגים 3 מתוך 3 מיקומים')).toBeVisible()

  await selectAutocompleteOption(page, /מפעיל/, 'אגד')
  await expect(page.getByText('מוצגים 1 מתוך 3 מיקומים')).toBeVisible()
})

test('filters map locations by minimum speed and clears the filter', async ({ page }) => {
  await setupFilterMapFixture(page)
  await openFilters(page)

  const slider = page.getByRole('slider', { name: 'מהירות מינימלית' })
  await slider.focus()
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('ArrowLeft')
  }

  await expect(slider).toHaveAttribute('aria-valuenow', '50')
  await expect(page.getByText('מוצגים 2 מתוך 3 מיקומים')).toBeVisible()
  await page.getByRole('button', { name: 'ניקוי מסננים' }).click()
  await expect(page.getByText('מוצגים 3 מתוך 3 מיקומים')).toBeVisible()
})
