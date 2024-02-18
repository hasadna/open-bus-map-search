import { test } from './utils'
import { Eyes, Target } from '@applitools/eyes-playwright'
import username from 'git-username'

test.describe('Visual Tests', () => {
  const eyes = new Eyes()
  test.beforeAll(() => {
    eyes.setBatch(username() + ' is testing openbus ' + new Date().toLocaleString().split(',')[0])
  })

  test.beforeEach(async ({ page }, testinfo) => {
    if (!process.env.APPLITOOLS_API_KEY) {
      throw new Error('APPLITOOLS_API_KEY is not defined, please ask noamgaash for the key')
    }

    await eyes.open(page, 'OpenBus', testinfo.title)
  })

  test.afterEach(async () => {
    await eyes.close()
  })

  test('dashboard page should look good', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByText('אגד').first().waitFor()
    while ((await page.locator('.ant-skeleton-content').count()) > 0)
      await page.locator('.ant-skeleton-content').last().waitFor({ state: 'hidden' })
    await eyes.check('dashboard page', Target.window())
    // scroll to recharts-wrapper
    await page.evaluate(() => {
      document.querySelector('.recharts-wrapper')?.scrollIntoView()
    })
    await eyes.check('dashboard page - recharts', Target.window())
  })

  test('about page should look good', async ({ page }) => {
    await page.goto('/about')
    await eyes.check('about page', Target.window())
  })

  test('timeline page should look good', async ({ page }) => {
    await page.goto('/timeline')
    await eyes.check('timeline page', Target.window())
  })

  test('gaps page should look good', async ({ page }) => {
    await page.goto('/gaps')
    await eyes.check('gaps page', Target.window())
  })

  test('gaps_patterns page should look good', async ({ page }) => {
    await page.goto('/gaps_patterns')
    await eyes.check('gaps_patterns page', Target.window())
  })

  test('map page should look good', async ({ page }) => {
    await page.goto('/map')
    await page.getByText('מיקומי אוטובוסים').first().waitFor()
    await page.locator('.ant-spin-dot').first().waitFor({ state: 'hidden' })
    await eyes.check('map page', Target.window())
  })
})
