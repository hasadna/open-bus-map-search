import { expect } from '@playwright/test'
import { getPastDate, test, urlMatcher, waitForSkeletonsToHide } from './utils'

test.describe('dashboard tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    await page.clock.setSystemTime(getPastDate())
    advancedRouteFromHAR('tests/HAR/dashboard.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'fallback',
      url: /stride-api/,
      matcher: urlMatcher,
    })
    await page.goto('/dashboard')
    await page.getByText('הקווים הגרועים ביותר').waitFor()
    await waitForSkeletonsToHide(page)
  })

  test('page is working', async () => {})

  test('dark mode use localstorage', async ({ page }) => {
    await page.getByLabel('עבור למצב כהה').click()
    await page.reload()
    await page.getByLabel('עבור למצב בהיר').click()
    await page.reload()
    await page.getByLabel('עבור למצב כהה').click()
    await page.getByLabel('עבור למצב בהיר').click()
  })

  test('dashboard charts contain information', async ({ page }) => {
    await expect(page.getByText('686 | קווים').first()).toBeVisible()
    await expect(page.getByText('מועצה אזורית גולן').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'אגד', exact: true })).toBeVisible()
  })
})
