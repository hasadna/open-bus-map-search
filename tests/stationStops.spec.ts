import { expect, test } from './test_pages/StationStopsPage'
import { clearInputField, harOptions, setupTest, verifyDateFromParameter, visitPage } from './utils'

const ROUTE = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
const STATION = 'חיים הרצוג/שדרות מנחם בגין (גדרה)'

test.describe('Station Stops Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/stationStops.har', harOptions)
    await visitPage(page, 'station_stops_page_title')
  })

  test.describe('Route selection visibility tests', () => {
    test('route selection should appear after line number selected', async ({
      stationStopsPage,
    }) => {
      await stationStopsPage.selectOperator('אגד')
      await stationStopsPage.lineNumberField.fill('1')
      await expect(stationStopsPage.routeSelect).toBeEnabled()
    })

    test('clearing the line number should hide route selection', async ({ stationStopsPage }) => {
      await stationStopsPage.selectOperator('אגד')
      await stationStopsPage.lineNumberField.fill('1')
      await expect(stationStopsPage.routeSelect).toBeEnabled()
      await clearInputField(stationStopsPage.lineNumberField)
      await expect(stationStopsPage.lineNumberField).toBeEmpty()
      await expect(stationStopsPage.routeSelect).toBeDisabled()
    })
  })

  test('should have no duplications in Operators list', async ({ stationStopsPage }) => {
    await stationStopsPage.operatorsSelect.click()
    const options = await stationStopsPage.getDropdownOptions()
    expect(options).not.toHaveDuplications()
  })

  test('should have no duplications in Route Selection list', async ({ stationStopsPage }) => {
    await stationStopsPage.selectOperator('אגד')
    await stationStopsPage.lineNumberField.fill('1')
    await expect(stationStopsPage.routeSelect).toBeEnabled()
    await stationStopsPage.routeSelect.click()
    const options = await stationStopsPage.getDropdownOptions()
    expect(options).not.toHaveDuplications()
  })

  test('should indicate when the line Number is not found', async ({ stationStopsPage, page }) => {
    await stationStopsPage.selectOperator('דן בדרום')
    await stationStopsPage.lineNumberField.fill('9999')
    await expect(page.getByText('הקו לא נמצא')).toBeEnabled()
  })

  test('The station selection drop box should appear', async ({ stationStopsPage }) => {
    await stationStopsPage.selectOperator('אגד')
    await stationStopsPage.lineNumberField.fill('1')
    await expect(stationStopsPage.routeSelect).toBeEnabled()
    await stationStopsPage.selectRoute(ROUTE)
    await expect(stationStopsPage.stationSelect).toBeEnabled()
  })

  test('Should load stations list', async ({ stationStopsPage }) => {
    await stationStopsPage.selectOperator('אגד')
    await stationStopsPage.lineNumberField.fill('1')
    await expect(stationStopsPage.routeSelect).toBeEnabled()
    await stationStopsPage.selectRoute(ROUTE)
    await expect(stationStopsPage.stationSelect).toBeEnabled()
    await stationStopsPage.stationSelect.click()
    const options = await stationStopsPage.getDropdownOptions()
    expect(options.length).toBeGreaterThan(0) // at least one station
  })

  test('Test choosing [Operator -> Line # -> Route -> Stop station] opens the timestamp graph', async ({
    stationStopsPage,
  }) => {
    await stationStopsPage.selectOperator('אגד')
    await stationStopsPage.lineNumberField.fill('1')
    await expect(stationStopsPage.routeSelect).toBeEnabled()
    await stationStopsPage.selectRoute(ROUTE)
    await expect(stationStopsPage.stationSelect).toBeEnabled()
    await stationStopsPage.selectStation(STATION)
    await stationStopsPage.WaitForLoadingCompletion()
    await expect(stationStopsPage.timelineHourLabels).toContainText(['17:00:59'])
    expect(await stationStopsPage.timelineHourLabels.count()).toBe(50)
  })

  test('Verify date_from parameter', async ({ page }) => {
    await verifyDateFromParameter(page)
  })
})
