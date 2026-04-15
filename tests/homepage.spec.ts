import { expect, setupTest, test } from './utils'

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('homepage displays welcome heading and description', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h2')).toBeVisible()
    await expect(page.locator('p').first()).toBeVisible()
  })

  test('homepage displays bus illustration', async ({ page }) => {
    const img = page.locator('img[alt="Public Transportaion Bus Illustration"]')
    await expect(img).toBeVisible()
  })

  test('homepage displays navigation links to main pages', async ({ page }) => {
    const links = page.locator('section.links .page-link')
    await expect(links).toHaveCount(6)
  })

  test('clicking a page link navigates to the correct page', async ({ page }) => {
    const timelineLink = page.locator('section.links .page-link a[href="/timeline"]')
    await timelineLink.click()
    await expect(page).toHaveURL(/\/timeline/)
  })

  test('homepage displays copyright footer', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText(new Date().getFullYear().toString())
  })
})
