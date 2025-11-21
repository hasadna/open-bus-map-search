import { test } from 'src/test_pages/TimelinePage'
import { harOptions, setupTest, verifyDateFromParameter, visitPage } from './utils'

test.describe('Timeline Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/timeline.har', harOptions)
    await visitPage(page, 'timeline_page_title')
  })

  test('Test route selection disappears after line number is closed', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.closeLineNumber()
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, false)
  })

  test('Test route selection appears after line number selected', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true)
  })

  test('Test Verify no duplications in Operators list', async ({ timelinePage }) => {
    await timelinePage.openSelectBox(timelinePage.operatorsDropDown)
    await timelinePage.verifyNoDuplications()
  })

  test('Test Verify no duplications in Route Selection list', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true)
    await timelinePage.openSelectBox(timelinePage.routeSelect)
    await timelinePage.verifyNoDuplications()
  })

  test('Test Verify the line Number is not found', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'דן בדרום',
    )
    await timelinePage.fillLineNumber('9999')
    await timelinePage.verifyLineNumberNotFound()
  })

  test('Test Verify station selection drop box appears', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true)
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await timelinePage.verifyRouteSelectionVisible(timelinePage.stationSelect, true)
  })

  test('Test Verify no duplications in stations list', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true)
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await timelinePage.verifyRouteSelectionVisible(timelinePage.stationSelect, true)
    //have duplications in stations list.
    // await timelinePage.openSelectBox(timelinePage.stationSelect)
    // await timelinePage.verifyNoDuplications()
  })

  test('Test choosing [Operator -> Line # -> Route -> Stop station] opens the timestamp graph', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(timelinePage.routeSelect, true)
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

  test('Verify date_from parameter from - "Trips history"', async ({ page }) => {
    await verifyDateFromParameter(page)
  })
})
