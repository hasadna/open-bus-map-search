import { expect, getPastDate, test, urlMatcher } from './utils'
import SinglelinePage from 'src/test_pages/SinglelinePage'
import dayjs from 'src/dayjs'

test.describe('Single line page tests', () => {
  let singleLinePage: SinglelinePage

  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    advancedRouteFromHAR('tests/HAR/singleline.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'abort',
      url: /stride-api/,
      matcher: urlMatcher,
    })
    singleLinePage = new SinglelinePage(page)
    await singleLinePage.setFakeTime(getPastDate())
    await page.goto('/')
    await page.getByText('מפה לפי קו').click()
  })

  test('Test single line operator company options are selectable', async () => {
    await singleLinePage.openOperatorSelection()
    await singleLinePage.verifyOperatorExistsInDropbox('אגד')
  })

  test('Test "choose route" dropdown appears after selecting line', async () => {
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.verifyRouteSelectionEnable()
  })

  test('Test "choose route" dropdown disappears after removing line', async () => {
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.verifyRouteSelectionEnable()
    await singleLinePage.closeLineNumber()
    await singleLinePage.verifyRouteSelectionEnable(false)
  })

  test('Test "choose route" options are selectable', async () => {
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.selectRandomRoute()
  })

  test('Test route appears after select route', async ({ page }) => {
    await test.step('Navigate to "Map By Line"', async () => {
      await page.goto('/')
      await page.getByRole('link', { name: 'מפה לפי קו' }).click()
    })

    await test.step('Fill line info', async () => {
      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'דן', exact: true }).click()
      await page.getByPlaceholder('לדוגמה: 17א').fill('67')
      await page.getByLabel('בחירת מסלול נסיעה (2 אפשרויות)').click()
      await page
        .getByRole('option', { name: 'קניון איילון-רמת גן ⟵ איצטדיון וינטר-רמת גן' })
        .click()
    })

    await test.step('Verify bus stop marker is in the page', async () => {
      const stopMarker = page.locator('.leaflet-marker-pane > img[src$="marker-bus-stop.png"]')
      await expect(stopMarker).toHaveCount(33)
    })
  })

  test('tooltip appears after clicking on map point in single line map', async ({ page }) => {
    await test.step('Navigate to "Map By Line"', async () => {
      await page.goto('/')
      await page.getByRole('link', { name: 'מפה לפי קו' }).click()
    })

    await test.step('Fill line info', async () => {
      await page.getByLabel('חברה מפעילה').click()
      await page.getByRole('option', { name: 'דן', exact: true }).click()
      await page.getByPlaceholder('לדוגמה: 17א').fill('67')
      await page.getByLabel('בחירת מסלול נסיעה (2 אפשרויות)').click()
      await page
        .getByRole('option', { name: 'קניון איילון-רמת גן ⟵ איצטדיון וינטר-רמת גן' })
        .click()
      await page.getByLabel('בחירת שעת התחלה').click()
      await page.getByRole('option', { name: ':58' }).click()
    })

    await test.step('Click on bus button', async () => {
      const button = page.locator('.leaflet-marker-pane > img[src$="marker-dot.png"]').nth(6)
      await button.click()
      await button.click({ force: true })
    })

    await test.step('Click inside tooltip"', async () => {
      await page.getByRole('button', { name: 'הצג מידע לגיקים' }).click()
      await page.getByRole('button', { name: 'הסתר מידע לגיקים' }).click()
    })

    await test.step('Expecting the tooltip to have the correct content', async () => {
      const contentItemsInOrder = [
        'שם חברה מפעילה:',
        'מוצא:',
        'יעד:',
        'מהירות:',
        'זמן דגימה:',
        'לוחית רישוי:',
        'כיוון נסיעה:',
        'נ.צ.:',
      ]
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
      expect(textList).toEqual(contentItemsInOrder)
    })
  })
})

test('verify API call to gtfs_agencies/list - "Map by line"', async ({ page }) => {
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
