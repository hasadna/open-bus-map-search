import i18next from 'i18next'
import { expect, setupTest, test } from './utils'

test.describe('Line Profile Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('navigating to a profile route renders the page', async ({ page }) => {
    await page.goto('/profile/1')
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    const heading = page.locator('h4').first()
    await expect(heading).toBeVisible()
  })

  test('profile page displays operator selector', async ({ page }) => {
    await page.goto('/profile/1')
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    const operatorSelect = page.locator('#operator-select')
    await expect(operatorSelect).toBeVisible()
  })

  test('profile page displays date selector', async ({ page }) => {
    await page.goto('/profile/1')
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    const dateInput = page.getByRole('textbox').first()
    await expect(dateInput).toBeVisible()
  })

  test('profile page displays a map', async ({ page }) => {
    await page.goto('/profile/1')
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    const mapContainer = page.locator('.leaflet-container')
    await expect(mapContainer).toBeVisible()
  })

  test('navigating to a non-existent profile shows not found message', async ({ page }) => {
    await page.goto('/profile/99999999')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(i18next.t('lineProfile.notFound'))).toBeVisible()
  })

  test('stop selector is present on the profile page', async ({ page }) => {
    await page.goto('/profile/1')
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await page.waitForLoadState('networkidle')
    const stopSelect = page.locator('#stop-select')
    await expect(stopSelect).toBeVisible()
  })
})
