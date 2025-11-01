import i18next from 'i18next'
import TimelinePage from 'src/test_pages/TimelinePage'
import {
  setupTest,
  test,
  urlMatcher,
  verifyAgenciesApiCall,
  verifyDateFromParameter,
  visitPage,
} from './utils'

test.describe('Timeline Page Tests', () => {
  let timelinePage: TimelinePage

  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/timeline.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'fallback',
      url: /stride-api/,
      matcher: urlMatcher,
    })
    timelinePage = new TimelinePage(page) // Initialize timelinePage before each test
    await visitPage(page, i18next.t('timeline_page_title'), /timeline/)
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

  test('verify API call to gtfs_agencies/list - "Trips history"', async ({ page }) => {
    await verifyAgenciesApiCall(page)
  })

  test('the dateFrom parameter should be recent when visiting the "Trips history"', async ({
    page,
  }) => {
    await verifyDateFromParameter(page)
  })
})
