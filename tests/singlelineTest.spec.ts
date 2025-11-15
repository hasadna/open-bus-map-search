import type { Page } from '@playwright/test'
import {
  expect,
  harOptions,
  setupTest,
  test,
  verifyDateFromParameter,
  visitPage,
  waitForSkeletonsToHide,
} from './utils'

const BUS_MARKER_SELECTOR = '.leaflet-marker-pane > img[src$="marker-dot.png"]'
const STATION_MARKER_SELECTOR = '.leaflet-marker-pane > img[src$="marker-bus-stop.png"]'

async function selectOperator(page: Page, operatorName = 'אודליה מוניות בעמ') {
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('option', { name: operatorName, exact: true }).click()
}

async function fillLineNumber(page: Page, lineNumber = '16') {
  await page.getByRole('textbox', { name: 'מספר קו' }).fill(lineNumber)
}

async function selectRoute(
  page: Page,
  routeName = 'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו',
) {
  await page.getByLabel(/בחירת מסלול נסיעה/).click()
  await page.getByRole('option', { name: routeName }).click()
}

async function selectStartTime(page: Page, time = '04:30') {
  await page.getByLabel('בחירת שעת התחלה').click()
  await page.getByRole('option', { name: time }).click()
}

test.describe('Single line page tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/singleline.har', harOptions)
    await visitPage(page, 'singleline_map_page_title')
  })

  test('should allow selecting operator company options', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'מספר קו' })).not.toBeEditable()
    await selectOperator(page)
    await expect(page.getByLabel('חברה מפעילה')).toHaveValue('אודליה מוניות בעמ')
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
    await expect(page.getByLabel(/בחירת מסלול נסיעה/)).toHaveValue(/תחנת מוניות תל אביב הכובשים/)

    await test.step('Verify bus stop marker is in the page', async () => {
      await expect(page.locator(STATION_MARKER_SELECTOR)).toHaveCount(2, { timeout: 10000 })
    })
  })

  test('should show tooltip after clicking on map point in single line map', async ({ page }) => {
    await test.step('Fill line info', async () => {
      await selectOperator(page)
      await fillLineNumber(page)
      await selectRoute(page)
      await expect(page.locator(STATION_MARKER_SELECTOR)).toHaveCount(2, { timeout: 10000 })
      await selectStartTime(page)
      await expect(page.locator(BUS_MARKER_SELECTOR)).toHaveCount(70, { timeout: 10000 })
    })

    await test.step('Click on bus button', async () => {
      await page.getByText('מסלול בפועלמסלול מתוכנן').click()
      await page.locator(BUS_MARKER_SELECTOR).nth(2).click({ force: true })
      await expect(page.locator('.leaflet-popup-content-wrapper')).toBeAttached({ timeout: 10000 })
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

  test('Verify date_from parameter from - "Map by line"', async ({ page }) => {
    await verifyDateFromParameter(page)
  })
})
