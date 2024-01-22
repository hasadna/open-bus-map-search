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
})
