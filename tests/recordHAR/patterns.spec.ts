import { goToPage, recordTest } from './utils'

recordTest('patterns.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/gaps_patterns')
  // Open operator dropdown to trigger gtfs_agencies/list
  await page.getByLabel('חברה מפעילה').click()
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Escape')
  // Reload mirrors what verifyDateFromParameter does, capturing a second round of requests
  await page.reload()
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
  await page.getByLabel('חברה מפעילה').click()
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Escape')
})
