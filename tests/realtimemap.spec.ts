import type { Page } from '@playwright/test'
import i18next from 'i18next'
import { expect, fillDateField, getPastDate, harOptions, setupTest, test, visitPage } from './utils'

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

// Every distinct siri_vehicle_locations window the page asked for, in request order.
// The hook splits a range into one request per minute and pages each one by offset,
// so a wider range shows up as extra windows here, not as a longer one.
let requestedWindows: string[] = []

function trackRequestedWindows(page: Page) {
  requestedWindows = []
  page.on('request', (request) => {
    if (!request.url().includes('/siri_vehicle_locations/list')) return
    const params = new URL(request.url()).searchParams
    const window = `${params.get('recorded_at_time_from')} - ${params.get('recorded_at_time_to')}`
    if (!requestedWindows.includes(window)) requestedWindows.push(window)
  })
}

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  trackRequestedWindows(page)
  await page.clock.setSystemTime(getPastDate())
  await advancedRouteFromHAR('tests/HAR/realtimemap.har', harOptions)
  await visitPage(page, 'time_based_map_page_title')
})

test('tooltip appears after clicking on map point', async ({ page }) => {
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

test.describe('requested time window', () => {
  const DEFAULT_WINDOW = '2023-03-14T15:00:00.000Z - 2023-03-14T15:01:00.000Z'

  // Wait for the expected windows, then let the network settle and check again
  // so that an extra window requested a moment later still fails the test.
  async function expectRequestedWindows(page: Page, expected: string[]) {
    await expect.poll(() => requestedWindows).toEqual(expected)
    await page.waitForLoadState('networkidle')
    expect(requestedWindows).toEqual(expected)
  }

  test('on load, the window is the default minute', async ({ page }) => {
    await expectRequestedWindows(page, [DEFAULT_WINDOW])
  })

  test('changing the time moves the end of the window with it', async ({ page }) => {
    const minutes = page
      .getByRole('group', { name: i18next.t('choose_time') })
      .getByRole('spinbutton')
      .nth(1)
    await minutes.fill('30')
    await minutes.press('Tab')

    await expectRequestedWindows(page, [
      DEFAULT_WINDOW,
      '2023-03-14T15:30:00.000Z - 2023-03-14T15:31:00.000Z',
    ])
  })

  test('changing the date moves the end of the window with it', async ({ page }) => {
    await fillDateField(page, i18next.t('choose_date'), '15/03/2023')

    await expectRequestedWindows(page, [
      DEFAULT_WINDOW,
      '2023-03-15T15:00:00.000Z - 2023-03-15T15:01:00.000Z',
    ])
  })
})
