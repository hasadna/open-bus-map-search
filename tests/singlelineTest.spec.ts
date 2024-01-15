import { getYesterday, test } from './utils'
import SinglelinePage from '../src/test_pages/SinglelinePage'

test.describe('Single line page tests', () => {
  let singleLinePage: SinglelinePage
  const yesterday = getYesterday() // we set the date to yesterday so we dont get the edge case of buses not loading at 12AM

  test.beforeEach(async ({ page }) => {
    singleLinePage = new SinglelinePage(page)
    await page.goto('/')
    await page.getByText('מפה לפי קו').click()
  })

  test('Test single line operator company options are selectable', async () => {
    await singleLinePage.changeDate(yesterday)
    await singleLinePage.selectOperatorFromDropbox('אגד')
  })

  test('Test "choose route" dropdown appears after selecting line', async () => {
    await singleLinePage.changeDate(yesterday)
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.verifyRouteSelectionVisible(true)
  })

  test('Test "choose route" dropdown disappears after removing line', async () => {
    await singleLinePage.changeDate(yesterday)
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.verifyRouteSelectionVisible(true)
    await singleLinePage.closeLineNumber()
    await singleLinePage.verifyRouteSelectionVisible(false)
  })

  test('Test "choose route" options are selectable', async () => {
    await singleLinePage.changeDate(yesterday)
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.selectRandomRoute()
  })
})
