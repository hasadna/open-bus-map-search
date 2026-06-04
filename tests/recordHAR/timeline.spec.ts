import { goToPage, openDropdownAndWait, recordTest } from './utils'

recordTest('timeline.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/timeline')

  // Trigger agencies list by opening operator dropdown
  await openDropdownAndWait(page, '#operator-select')

  // Select אגד and fill line 1 (triggers routes list)
  await page.getByRole('option', { name: 'אגד', exact: true }).click()
  await page.getByPlaceholder('לדוגמה: 17א').fill('1')
  await page.waitForLoadState('networkidle')

  // Select route used for timeline hits test
  await openDropdownAndWait(page, '#route-select')
  const routeWithHits = 'שדרות מנחם בגין/כביש 7-גדרה ⟵ שדרות מנחם בגין/כביש 7-גדרה'
  const hitsRouteExists = await page.getByRole('option', { name: routeWithHits }).count()
  if (hitsRouteExists > 0) {
    await page.getByRole('option', { name: routeWithHits, exact: true }).click()
    await page.waitForLoadState('networkidle')
    await openDropdownAndWait(page, '#stop-select')
    const stopOption = page.getByRole('option', { name: 'חיים הרצוג/שדרות מנחם בגין (גדרה)' })
    if ((await stopOption.count()) > 0) {
      await stopOption.click()
      await page.locator('.MuiCircularProgress-svg').waitFor({ state: 'hidden' })
      await page.waitForLoadState('networkidle')
    } else {
      await page.keyboard.press('Escape')
    }
  } else {
    await page.keyboard.press('Escape')
  }

  // Also test אגד operator without clearing (so duplication test passes)

  // Test empty routes: switch to דן בדרום + line 9999
  // First clear the operator by navigating away and back
  await page.goto('/timeline')
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await openDropdownAndWait(page, '#operator-select')
  const danBaDarom = page.getByRole('option', { name: 'דן בדרום', exact: true })
  if ((await danBaDarom.count()) > 0) {
    await danBaDarom.click()
    await page.getByPlaceholder('לדוגמה: 17א').fill('9999')
    await page.waitForLoadState('networkidle')
    await page.getByText('הקו לא נמצא').waitFor({ state: 'visible' })
  } else {
    await page.keyboard.press('Escape')
  }
})
