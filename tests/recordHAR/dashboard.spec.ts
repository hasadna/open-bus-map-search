import { goToPage, recordTest } from './utils'

recordTest('dashboard.har', async (page) => {
  await goToPage(page, '/')
  await page.goto('/dashboard')
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
  // Reload so the page component is already in memory: PersistQueryClientProvider
  // async hydration completes faster, and the three group_by requests are
  // in-flight before networkidle fires — so they get captured in the HAR.
  await page.reload()
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
})
