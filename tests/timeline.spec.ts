import { expect, test } from 'src/test_pages/TimelinePage'
import { harOptions, setupTest, verifyDateFromParameter, visitPage } from './utils'

test.describe('Timeline Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/timeline.har', harOptions)
    await visitPage(page, 'timeline_page_title')
  })

  test.describe('Route selection visibility tests', () => {
    test('route selection should appear after line number selected', async ({ timelinePage }) => {
      await timelinePage.selectOperator('אגד')
      await timelinePage.lineNumberField.fill('1')
      await expect(timelinePage.routeSelect).toBeVisible()
    })

    test('clearing the line number should hide route selection', async ({ timelinePage }) => {
      await timelinePage.selectOperator('אגד')
      await timelinePage.lineNumberField.fill('1')
      await expect(timelinePage.routeSelect).toBeVisible()
      await timelinePage.closeButton.click()
      await expect(timelinePage.lineNumberField).toBeEmpty()
      await expect(timelinePage.routeSelect).toBeHidden()
    })
  })

  test('should have no duplications in Operators list', async ({ timelinePage }) => {
    await timelinePage.operatorsDropDown.click()
    const options = await timelinePage.getDropdownOptions()
    expect(options).not.toHaveDuplications()
  })

  test('should have no duplications in Route Selection list', async ({ timelinePage }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.routeSelect.click()
    const options = await timelinePage.getDropdownOptions()
    expect(options).not.toHaveDuplications()
  })

  test('should indicate when the line Number is not found', async ({ timelinePage, page }) => {
    await timelinePage.selectOperator('דן בדרום')
    await timelinePage.lineNumberField.fill('9999')
    await expect(page.getByText('הקו לא נמצא')).toBeVisible()
  })

  test('The station selection drop box should appear', async ({ timelinePage }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.selectRoute(
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await expect(timelinePage.stationSelect).toBeVisible()
  })

  test('Should load stations list', async ({ timelinePage }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.selectRoute(
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await expect(timelinePage.stationSelect).toBeVisible()
    await timelinePage.stationSelect.click()
    const options = await timelinePage.getDropdownOptions()
    expect(options.length).toBeGreaterThan(0) // at least one station
  })

  test('Test choosing [Operator -> Line # -> Route -> Stop station] opens the timestamp graph', async ({
    timelinePage,
  }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeVisible()
    await timelinePage.selectRoute('שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה')
    await expect(timelinePage.stationSelect).toBeVisible()
    await timelinePage.selectStation('חיים הרצוג/שדרות מנחם בגין (גדרה)')
    await expect(timelinePage.timelineGraph).toBeVisible()
  })

  test('Verify date_from parameter', async ({ page }) => {
    await verifyDateFromParameter(page)
  })
})
