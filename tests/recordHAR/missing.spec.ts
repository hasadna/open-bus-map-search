import he from 'src/locale/he.json' with { type: 'json' }
import { goToPage, recordTest } from './utils'

// Transit data this recording depends on existing for the frozen test date.
const OPERATOR = 'אודליה מוניות בעמ'
const LINE = '16'
const ROUTE = 'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'

recordTest('missing.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/gaps')

  await page.getByLabel(he.choose_operator).click()
  await page.waitForLoadState('networkidle')

  const operator = page.getByRole('option', { name: OPERATOR, exact: true })
  if ((await operator.count()) > 0) {
    await operator.click()
  } else {
    await page.keyboard.press('Escape')
    return
  }

  await page.getByRole('textbox', { name: he.choose_line }).fill(LINE)
  await page.waitForLoadState('networkidle')

  await page.getByLabel(/בחירת מסלול נסיעה/).click()
  await page.waitForLoadState('networkidle')

  const routeOption = page.getByRole('option', { name: ROUTE })
  if ((await routeOption.count()) > 0) {
    const waitForGaps = page.waitForResponse((response) =>
      response.url().includes('/rides_execution/list'),
    )
    await routeOption.click()
    // waitForResponse alone resolves at headers — .body() blocks until the full
    // rides_execution body arrives, so it gets embedded in the HAR (otherwise the
    // entry is recorded with size:-1 and no text, and the gaps table has no rides).
    await waitForGaps.then((r) => r.body())
    await page.waitForLoadState('networkidle')
  } else {
    await page.keyboard.press('Escape')
  }
})
