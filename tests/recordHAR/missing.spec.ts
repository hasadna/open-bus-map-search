import { test } from '@playwright/test'
import { goToPage, setupRecording } from './utils'

test.describe('Record missing.har', () => {
  test.skip(!process.env['RECORD_HAR'], 'Set RECORD_HAR=1 to update HAR files')

  test('record missing.har', async ({ page }) => {
    await setupRecording(page, 'tests/HAR/missing.har')
    await goToPage(page, '/')
    await goToPage(page, '/gaps')

    await page.getByLabel('חברה מפעילה').click()
    await page.waitForLoadState('networkidle')

    const operator = page.getByRole('option', { name: 'אודליה מוניות בעמ', exact: true })
    if ((await operator.count()) > 0) {
      await operator.click()
    } else {
      await page.keyboard.press('Escape')
      return
    }

    await page.getByRole('textbox', { name: 'מספר קו' }).fill('16')
    await page.waitForLoadState('networkidle')

    await page.getByLabel(/בחירת מסלול נסיעה/).click()
    await page.waitForLoadState('networkidle')

    const route =
      'תחנת מוניות רמת גן דרך הטייסים-תל אביב יפו ⟵ תחנת מוניות תל אביב הכובשים-תל אביב יפו'
    const routeOption = page.getByRole('option', { name: route })
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
})
