import he from 'src/locale/he.json' with { type: 'json' }
import { goToPage, openDropdownAndWait, recordTest } from './utils'

// Transit data this recording depends on existing for the frozen test date.
const OPERATOR = 'אלקטרה אפיקים'
const LINE = '64'

recordTest('clearbutton.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/timeline')

  // Trigger agencies list
  await openDropdownAndWait(page, '#operator-select')

  // Select the operator and fill the line
  const operatorOption = page.getByRole('option', { name: OPERATOR, exact: true })
  if ((await operatorOption.count()) > 0) {
    await operatorOption.click()
    await page.getByPlaceholder(he.line_placeholder).fill(LINE)
    await page.waitForLoadState('networkidle')
    // Open route dropdown to ensure routes are fetched
    await openDropdownAndWait(page, '#route-select')
    await page.keyboard.press('Escape')
  } else {
    await page.keyboard.press('Escape')
  }
})
