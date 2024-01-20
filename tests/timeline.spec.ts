import TimelinePage from '../src/test_pages/TimelinePage'
import { test } from '@playwright/test'

test.describe('Timeline Page Tests', () => {
  let timelinePage: TimelinePage

  test.beforeEach(async ({ page }) => {
    timelinePage = new TimelinePage(page) // Initialize timelinePage before each test
    await page.goto('/')
    await page.getByText('לוח זמנים היסטורי', { exact: true }).click()
    await page.getByRole('progressbar').waitFor({ state: 'hidden' })
  })

  test('Test route selection disappears after line number is closed', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.selectOperatorFromDropbox('אגד')
    await timelinePage.fillLineNumber('1')
    await timelinePage.closeLineNumber()
    await timelinePage.verifyRouteSelectionVisible(false)
  })

  test('Test route selection appears after line number selected', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.selectOperatorFromDropbox('אגד')
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(true)
  })

  test('Test Verify no duplications in Operators list', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.verifyDuplications(timelinePage.operators_dropdown)
  })

  test('Test Verify no duplications in Route Selection list', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.selectOperatorFromDropbox('אגד')
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(true)
    await timelinePage.verifyDuplications(timelinePage.route_select)
  })

  test('Test Verify the line Number is not found', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.selectOperatorFromDropbox('אגד תעבורה')
    await timelinePage.fillLineNumber('2')
    await timelinePage.verifyLineNumberNotFound()
  })

  test('Test Verify station selection drop box appears', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.selectOperatorFromDropbox('אגד')
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(true)
    await timelinePage.selectRouteSelection(
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await timelinePage.verifyStationSelectionVisible()
  })

  test('Test Verify no duplications in stations list', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.selectOperatorFromDropbox('אגד')
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(true)
    await timelinePage.selectRouteSelection(
      'בית ספר אלונים/הבנים-פרדס חנה כרכור ⟵ יד לבנים/דרך הבנים-פרדס חנה כרכור  ',
    )
    await timelinePage.verifyStationSelectionVisible()
    await timelinePage.verifyDuplications(timelinePage.station_select)
  })

  test('Test choosing [Operator -> Line # -> Route -> Stop station] opens the timestamp graph', async () => {
    await timelinePage.validatePageUrl(/timeline/)
    await timelinePage.selectOperatorFromDropbox('אגד')
    await timelinePage.fillLineNumber('1')
    await timelinePage.verifyRouteSelectionVisible(true)
    await timelinePage.selectRouteSelection(
      'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה  ',
    )
    await timelinePage.verifyStationSelectionVisible()
    await timelinePage.selectStopStationSelection('חיים הרצוג/שדרות מנחם בגין (גדרה)')
    await timelinePage.verifyTimestampGraphSelectionVisible()
  })
})
