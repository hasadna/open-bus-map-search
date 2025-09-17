import { expect } from '@playwright/test'
import { test } from './utils'

const versionUrl = 'https://open-bus-map-search.hasadna.org.il/hash.txt'

test.describe('Version info tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    await page.route(/github.com/, (route) => route.abort())
    await page.goto('/about')
  })
  test('should see loading state', async ({ page }) => {
    await page.route(versionUrl, () => void 0)
    await expect(page.getByRole('heading', { name: 'גרסה' })).toBeVisible()
    await expect(page.getByText('טוען...')).toBeVisible()
    // Wait for language dropdown and click English
    await page.click('[aria-label="Change Language"]')
    await page.click('text=English')
    await page.waitForTimeout(1000) // Wait for language change to complete
    await expect(page.getByRole('heading', { name: 'Current version identifier' })).toBeVisible()
    await expect(page.getByText('loading...')).toBeVisible()
  })
  test('should see version', async ({ page }) => {
    await page.route(versionUrl, (route) => route.fulfill({ body: 'my version' }))
    await expect(page.getByText('my version')).toBeVisible()
  })
  test('should see error message', async ({ page }) => {
    await page.route(versionUrl, (route) => route.abort())
    await expect(page.getByText('נכשל בטעינת מידע')).toBeVisible({ timeout: 15_000 })
    // Wait for language dropdown and click English
    await page.click('[aria-label="Change Language"]')
    await page.click('text=English')
    await page.waitForTimeout(1000) // Wait for language change to complete
    await expect(page.getByText('Failed to fetch current version identifier')).toBeVisible()
  })
})
