import { expect, test } from 'src/test_pages/TimelinePage'
import { harOptions, setupTest, verifyDateFromParameter, visitPage } from './utils'

const ROUTE = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
const STATION = 'חיים הרצוג/שדרות מנחם בגין (גדרה)'

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
      await expect(timelinePage.routeSelect).toBeEnabled()
    })

    test('clearing the line number should hide route selection', async ({ timelinePage }) => {
      await timelinePage.selectOperator('אגד')
      await timelinePage.lineNumberField.fill('1')
      await expect(timelinePage.routeSelect).toBeEnabled()
      await timelinePage.closeButton.click()
      await expect(timelinePage.lineNumberField).toBeEmpty()
      await expect(timelinePage.routeSelect).toBeDisabled()
    })
  })

  test('should have no duplications in Operators list', async ({ timelinePage }) => {
    await timelinePage.operatorsSelect.click()
    const options = await timelinePage.getDropdownOptions()
    expect(options).not.toHaveDuplications()
  })

  test('should have no duplications in Route Selection list', async ({ timelinePage }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeEnabled()
    await timelinePage.routeSelect.click()
    const options = await timelinePage.getDropdownOptions()
    expect(options).not.toHaveDuplications()
  })

  test('should indicate when the line Number is not found', async ({ timelinePage, page }) => {
    await timelinePage.selectOperator('דן בדרום')
    await timelinePage.lineNumberField.fill('9999')
    await expect(page.getByText('הקו לא נמצא')).toBeEnabled()
  })

  test('The station selection drop box should appear', async ({ timelinePage }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeEnabled()
    await timelinePage.selectRoute(ROUTE)
    await expect(timelinePage.stationSelect).toBeEnabled()
  })

  test('Should load stations list', async ({ timelinePage }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeEnabled()
    await timelinePage.selectRoute(ROUTE)
    await expect(timelinePage.stationSelect).toBeEnabled()
    await timelinePage.stationSelect.click()
    const options = await timelinePage.getDropdownOptions()
    expect(options.length).toBeGreaterThan(0) // at least one station
  })

  test('Test choosing [Operator -> Line # -> Route -> Stop station] opens the timestamp graph', async ({
    timelinePage,
  }) => {
    await timelinePage.selectOperator('אגד')
    await timelinePage.lineNumberField.fill('1')
    await expect(timelinePage.routeSelect).toBeEnabled()
    await timelinePage.selectRoute(ROUTE)
    await expect(timelinePage.stationSelect).toBeEnabled()
    await timelinePage.selectStation(STATION)
    await timelinePage.WaitForLoadingCompletion()
    await expect(timelinePage.timelineHourLabels).toContainText(['17:00:59'])
    expect(await timelinePage.timelineHourLabels.count()).toBe(50)
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

  test('Verify date_from parameter', async ({ page }) => {
    await verifyDateFromParameter(page)
  })
})

//Normalize route name by removing spaces, standardizing arrows, and trimming trailing numbers
function normalizeRouteName(route: string): string {
  if (!route) return ''
  return route
    .replace(/\s/g, '')
    .replace(/<->|⟵/g, '<->')
    .replace(/-?\d+$/, '')
}
