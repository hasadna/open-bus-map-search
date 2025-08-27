import i18next from 'i18next'
import { expect, getPastDate, loadTranslate, test, urlMatcher } from './utils'
import dayjs from 'src/dayjs'
import TimelinePage from 'src/test_pages/TimelinePage'

test.describe('Timeline Page Tests', () => {
  let timelinePage: TimelinePage

  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    await page.clock.setSystemTime(getPastDate())
    await loadTranslate(i18next)
    await advancedRouteFromHAR('tests/HAR/timeline.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'abort',
      url: /stride-api\/list\?/,
      matcher: urlMatcher,
    })
    timelinePage = new TimelinePage(page) // Initialize timelinePage before each test
    await page.goto('/')
    await page
      .getByText(i18next.t('timeline_page_title'), { exact: true })
      .and(page.getByRole('link'))
      .click()
    await page.getByRole('progressbar').waitFor({ state: 'hidden' })
    await timelinePage.validatePageUrl(/timeline/)
  })

  test('Test route selection disappears after line number is closed', async () => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.closeLineNumber()
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, false, 3000)
  })

  test('Test route selection appears after line number selected', async () => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true, 3000)
  })

  test('Test Verify no duplications in Operators list', async () => {
    await timelinePage.openSelectBox(timelinePage.operatorsDropDown)
    await timelinePage.verifyNoDuplications()
  })

  test('Test Verify no duplications in Route Selection list', async () => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true, 3000)
    await timelinePage.openSelectBox(timelinePage.routeSelect)
    await timelinePage.verifyNoDuplications()
  })

  test('Test Verify the line Number is not found', async () => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'דן בדרום',
    )
    await timelinePage.fillLineNumber('9999')
    await timelinePage.verifyLineNumberNotFound()
  })

  test('Test Verify station selection drop box appears', async () => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true, 3000)
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await timelinePage.verifyRouteSelectionVisible(timelinePage.stationSelect, true, 3000)
  })

  test('Test Verify no duplications in stations list', async () => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true, 3000)
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await timelinePage.verifyRouteSelectionVisible(timelinePage.stationSelect, true, 3000)
    //have duplications in stations list.
    // await timelinePage.openSelectBox(timelinePage.stationSelect)
    // await timelinePage.verifyNoDuplications()
  })

  test('Test choosing [Operator -> Line # -> Route -> Stop station] opens the timestamp graph', async () => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true, 3000)
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה  ',
    )
    await timelinePage.verifyRouteSelectionVisible(timelinePage.stationSelect, true)
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.stationSelect,
      timelinePage.stationList,
      'חיים הרצוג/שדרות מנחם בגין (גדרה)',
    )
    await timelinePage.verifyRouteSelectionVisible(timelinePage.timelineGraph, true, 100000)
  })
})

test('verify API call to gtfs_agencies/list - "Trips history"', async ({ page }) => {
  let apiCallMade = false
  page.on('request', (request) => {
    if (request.url().includes('gtfs_agencies/list')) {
      apiCallMade = true
    }
  })

  await page.goto('/')
  await page.getByRole('link', { name: 'היסטוריית נסיעות' }).click()
  await page.getByLabel('חברה מפעילה').click()
  expect(apiCallMade).toBeTruthy()
})

test('the dateFrom parameter should be recent when visiting the "Trips history"', async ({
  page,
}) => {
  const apiRequest = page.waitForRequest((request) => request.url().includes('gtfs_agencies/list'))

  await page.goto('/')
  await page.getByRole('link', { name: 'היסטוריית נסיעות' }).click()

  const request = await apiRequest
  const url = new URL(request.url())
  const dateFromParam = url.searchParams.get('date_from')
  const dateFrom = dayjs(dateFromParam)
  const daysAgo = dayjs().diff(dateFrom, 'days')

  expect(daysAgo).toBeGreaterThanOrEqual(0)
  expect(daysAgo).toBeLessThanOrEqual(3)
})
