import { test } from '@playwright/test'
import { goToPage, openDropdownAndWait, setupRecording } from './utils'

test.describe('Record clearbutton.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  test('record clearbutton.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/clearbutton.har')
    await goToPage(page, '/')
    await goToPage(page, '/timeline')

    // Trigger agencies list
    await openDropdownAndWait(page, '#operator-select')

    // Select אלקטרה אפיקים and fill line 64
    const elktraOption = page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true })
    if ((await elktraOption.count()) > 0) {
      await elktraOption.click()
      await page.getByPlaceholder('לדוגמה: 17א').fill('64')
      await page.waitForLoadState('networkidle')
      // Open route dropdown to ensure routes are fetched
      await openDropdownAndWait(page, '#route-select')
      await page.keyboard.press('Escape')
    } else {
      await page.keyboard.press('Escape')
    }
  })
})
