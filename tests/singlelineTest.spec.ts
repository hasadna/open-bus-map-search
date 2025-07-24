import type { Page } from '@playwright/test'
import { expect, getPastDate, test, urlMatcher, waitForSkeletonsToHide } from './utils'
import dayjs from 'src/dayjs'

async function selectOperator(page: Page, operatorName = 'דן') {
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('option', { name: operatorName, exact: true }).click()
}

async function fillLineNumber(page: Page, lineNumber = '67') {
  await page.getByRole('textbox', { name: 'מספר קו' }).fill(lineNumber)
}

async function selectRoute(page: Page, routeName = 'קניון איילון-רמת גן ⟵ איצטדיון וינטר-רמת גן') {
  await page.getByLabel(/בחירת מסלול נסיעה/).click()
  await page.getByRole('option', { name: routeName }).click()
}

async function selectStartTime(page: Page, time = '05:45') {
  await page.getByLabel('בחירת שעת התחלה').click()
  await page.getByRole('option', { name: time }).click()
}

test.describe('Single line page tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    await page.clock.setSystemTime(getPastDate())
    advancedRouteFromHAR('tests/HAR/singleline.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'fallback',
      url: /stride-api/,
      matcher: urlMatcher,
    })
    await page.goto('/')
    await page.getByText('מפה לפי קו').click()
  })

  test('should allow selecting operator company options', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'מספר קו' })).not.toBeEditable()
    await selectOperator(page)
    await expect(page.getByLabel('חברה מפעילה')).toHaveValue('דן')
    await expect(page.getByRole('textbox', { name: 'מספר קו' })).toBeEditable()
  })

  test('should show and enable "choose route" dropdown after selecting line', async ({ page }) => {
    await selectOperator(page)
    await expect(page.locator('#route-select')).not.toBeEditable()
    await fillLineNumber(page)
    await expect(page.locator('#route-select')).toBeEditable()
  })

  test('should hide "choose route" dropdown after removing line', async ({ page }) => {
    await selectOperator(page)
    await expect(page.locator('#route-select')).not.toBeEditable()
    await fillLineNumber(page)
    await expect(page.locator('#route-select')).toBeEditable()
    await page.locator("span[aria-label='close']").click()
    await expect(page.locator('#route-select')).not.toBeEditable()
  })

  test('should allow selecting "choose route" options', async ({ page }) => {
    await selectOperator(page)
    await fillLineNumber(page)
    await expect(page.locator('#route-select')).toBeEditable()
    await selectRoute(page)
    await expect(page.getByLabel(/בחירת מסלול נסיעה/)).toHaveValue(/קניון איילון/)
  })

  test('should display route after selecting route', async ({ page }) => {
    await test.step('Fill line info', async () => {
      await selectOperator(page)
      await fillLineNumber(page)
      await selectRoute(page)
    })

    await test.step('Verify bus stop marker is in the page', async () => {
      const stopMarkers = page.locator('.leaflet-marker-pane > img[src$="marker-bus-stop.png"]')
      await page.waitForTimeout(1000)
      const count = await stopMarkers.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test('should show tooltip after clicking on map point in single line map', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await test.step('Fill line info', async () => {
      await selectOperator(page)
      await fillLineNumber(page)
      await selectRoute(page)
      await selectStartTime(page)
      await page.waitForTimeout(1000)
    })

    await test.step('Click on bus button', async () => {
      await page.locator('.leaflet-container').click()
      await page.waitForTimeout(1000)
      await page
        .locator('.leaflet-marker-pane > img[src$="marker-dot.png"]')
        .nth(6)
        .click({ force: true })
      await page.waitForTimeout(100)
      await expect(page.locator('.leaflet-popup-content-wrapper')).toBeAttached()
      await waitForSkeletonsToHide(page)
    })

    await test.step('Click inside the tooltip', async () => {
      await page.getByRole('button', { name: 'הצג מידע לגיקים' }).click()
      await page.getByRole('button', { name: 'הסתר מידע לגיקים' }).click()
    })

    await test.step('Verify tooltip content and order', async () => {
      const expectedLabels = [
        'שם חברה מפעילה:',
        'מוצא:',
        'יעד:',
        'מהירות:',
        'זמן דגימה:',
        'לוחית רישוי:',
        'כיוון נסיעה:',
        'נ.צ.:',
      ]

      await expect(page.locator('div.content ul')).toBeVisible()

      const actualLabels = await page.$$eval('div.content ul li', (items) =>
        items
          .map((li) =>
            Array.from(li.childNodes)
              .filter((node) => node.nodeType === Node.TEXT_NODE)
              .map((node) => node.textContent?.trim() || '')
              .join('')
              .trim(),
          )
          .filter(Boolean),
      )

      expect(actualLabels).toEqual(expectedLabels)
    })
  })

  test('should show error or no options for invalid line number', async ({ page }) => {
    await selectOperator(page)
    await fillLineNumber(page, '9999')
    await expect(page.getByText('הקו לא נמצא')).toBeAttached()
  })
})

test('verify API call to gtfs_agencies/list - "Map by line"', async ({ page }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())

  let apiCallMade = false
  page.on('request', (request) => {
    if (request.url().includes('gtfs_agencies/list')) {
      apiCallMade = true
    }
  })

  await page.goto('/')
  await page.getByRole('link', { name: 'מפה לפי קו' }).click()
  await page.getByLabel('חברה מפעילה').click()
  expect(apiCallMade).toBeTruthy()
})

test('Verify date_from parameter from "Map by line"', async ({ page }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())

  const apiRequest = page.waitForRequest((request) => request.url().includes('gtfs_agencies/list'))

  await page.goto('/')
  await page.getByRole('link', { name: 'מפה לפי קו' }).click()

  const request = await apiRequest
  const url = new URL(request.url())
  const dateFromParam = url.searchParams.get('date_from')
  const dateFrom = dayjs(dateFromParam)
  const daysAgo = dayjs().diff(dateFrom, 'days')

  expect(daysAgo).toBeGreaterThanOrEqual(0)
  expect(daysAgo).toBeLessThanOrEqual(3)
})
