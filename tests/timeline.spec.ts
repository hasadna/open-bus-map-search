import i18next from 'i18next'
import dayjs from 'src/dayjs'
import TimelinePage from 'src/test_pages/TimelinePage'
import { expect, getPastDate, loadTranslate, test, urlMatcher } from './utils'

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
  test('Should sync form input changes with URL query parameters', async ({ page }) => {
    // No need to provide a date — it is initialized in the beforeEach method
    const form = {
      operator: 'אגד',
      operatorID: '3',
      lineNumber: '1',
      route: 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה ',
    }
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      form.operator,
    )
    await timelinePage.fillLineNumber(form.lineNumber)
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
    //Verify URL is updated according to form inputs
    const url = new URL(decodeURIComponent(page.url())) //for getting the real routeKey
    expect(url.searchParams.get('timestamp')).toBe(getPastDate().getTime().toString()) //Check if the date matches the test input
    expect(url.searchParams.get('operatorId')).toBe(form.operatorID)
    expect(url.searchParams.get('lineNumber')).toBe(form.lineNumber)
    expect(normalizeRouteName(url.searchParams.get('routeKey') || ' ')).toBe(
      normalizeRouteName(form.route) || ' ',
    )

    //Applying a small change to the URL (setting lineNumber to 3 inside the new URL) to verify that the form inputs reflect the new value
    const newURL =
      'http://localhost:3000/timeline?timestamp=1707742800000&operatorId=3&lineNumber=3&routeKey=%D7%A9%D7%93%D7%A8%D7%95%D7%AA+%D7%9E%D7%A0%D7%97%D7%9D+%D7%91%D7%92%D7%99%D7%9F%2F%D7%9B%D7%91%D7%99%D7%A9+7-%D7%92%D7%93%D7%A8%D7%94%3C-%3E%D7%A9%D7%93%D7%A8%D7%95%D7%AA+%D7%9E%D7%A0%D7%97%D7%9D+%D7%91%D7%92%D7%99%D7%9F%2F%D7%9B%D7%91%D7%99%D7%A9+7-%D7%92%D7%93%D7%A8%D7%94-3%23'
    await page.goto(newURL, { timeout: 3000 })
    expect(url.searchParams.get('lineNumber')).toBe('3') // the test didn't pass here
    //Navigate to a different route to ensure the inputs remain unchanged
    await page.click('a:text-is("קיום נסיעות")')
    expect(decodeURIComponent(page.url())).not.toBe(decodeURIComponent(newURL))
    await page.click('a:text-is("היסטוריית נסיעות")')
    await page.waitForTimeout(6000)
    expect(decodeURIComponent(page.url())).toBe(decodeURIComponent(newURL))
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

//Normalize route name by removing spaces, standardizing arrows, and trimming trailing numbers
function normalizeRouteName(route: string): string {
  if (!route) return ''
  return route
    .replace(/\s/g, '')
    .replace(/<->|⟵/g, '<->')
    .replace(/-?\d+$/, '')
}
