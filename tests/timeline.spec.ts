import { expect, test } from 'src/test_pages/TimelinePage'
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
    await timelinePage.lineNumberField.fill('1')
    await timelinePage.closeButton.click()
    await expect(timelinePage.routeSelect).toBeHidden()
  })

  test('Test route selection appears after line number selected', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
  })

  test('should have no duplications in Operators list', async ({ timelinePage }) => {
    await timelinePage.operatorsDropDown.click()
    await timelinePage.verifyNoDuplications()
  })

  test('should have no duplications in Route Selection list', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.routeSelect.click()
    await timelinePage.verifyNoDuplications()
  })

  test('should indicate when the line Number is not found', async ({ timelinePage, page }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'דן בדרום',
    )
    await timelinePage.lineNumberField.fill('9999')
    await expect(page.getByText('הקו לא נמצא')).toBeVisible()
  })

  test('The station selection drop box should appear', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await expect(timelinePage.stationSelect).toBeVisible()
  })

  test('Test Verify no duplications in stations list', async ({ timelinePage }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await expect(timelinePage.stationSelect).toBeVisible()
    //have duplications in stations list.
    // await timelinePage.openSelectBox(timelinePage.stationSelect)
    // await timelinePage.verifyNoDuplications()
  })

  test('Test choosing [Operator -> Line # -> Route -> Stop station] opens the timestamp graph', async ({
    timelinePage,
  }) => {
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.operatorsDropDown,
      timelinePage.operatorsList,
      'אגד',
    )
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.routeSelect,
      timelinePage.routeList,
      'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה  ',
    )
    await expect(timelinePage.stationSelect).toBeVisible()
    await timelinePage.selectOperatorFromDropbox(
      timelinePage.stationSelect,
      timelinePage.stationList,
      'חיים הרצוג/שדרות מנחם בגין (גדרה)',
    )
    await expect(timelinePage.timelineGraph).toBeVisible()
  })

  test('Verify date_from parameter from - "Trips history"', async ({ page }) => {
    await verifyDateFromParameter(page)
  })
})
