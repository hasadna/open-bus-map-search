import SinglelinePage from '../src/test_pages/SinglelinePage'
import { getPastDate, test, urlMatcher } from './utils'

test.describe('Single line page tests', () => {
  let singleLinePage: SinglelinePage

  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await advancedRouteFromHAR('tests/HAR/singleline.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'abort',
      url: /stride-api/,
      matcher: urlMatcher,
    })
    singleLinePage = new SinglelinePage(page)
    await singleLinePage.setFakeTime(getPastDate())
    await page.goto('/')
    await page.getByText('מפה לפי קו').click()
  })

  test('Test single line operator company options are selectable', async () => {
    await singleLinePage.openOperatorSelection()
    await singleLinePage.verifyOperatorExistsInDropbox('אגד')
  })

  test('Test "choose route" dropdown appears after selecting line', async () => {
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.verifyRouteSelectionVisible(true)
  })

  test('Test "choose route" dropdown disappears after removing line', async () => {
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.verifyRouteSelectionVisible(true)
    await singleLinePage.closeLineNumber()
    await singleLinePage.verifyRouteSelectionVisible(false)
  })

  test('Test "choose route" options are selectable', async () => {
    await singleLinePage.selectOperatorFromDropbox('אגד')
    await singleLinePage.fillLineNumber('1')
    await singleLinePage.selectRandomRoute()
  })
})

test('should find route', async ({ page }) => {
  await page.getByRole('link', { name: 'מפה לפי קו' }).click()
  await page.getByLabel('חברה מפעילה').click()
  await page.getByRole('option', { name: 'בית שמש אקספרס' }).click()
  await page.getByPlaceholder('לדוגמה: 17א').fill('6')
  await page
    .locator('div')
    .filter({ hasText: /^בחירת מסלול נסיעה \(2 אפשרויות\)$/ })
    .getByLabel('Open')
    .click()
  await page
    .getByRole('option', { name: 'בן איש חי/יוסף קארו-בית שמש ⟵ זכריה הנביא/אליהו הנביא-בית שמש' })
    .click()
})
