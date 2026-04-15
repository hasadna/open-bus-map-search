import i18next from 'i18next'
import { expect, setupTest, test } from './utils'

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await page.waitForLoadState('networkidle')
  })

  test('homepage displays welcome heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: i18next.t('homepage.welcome') }),
    ).toBeVisible()
  })

  test('homepage displays definition', async ({ page }) => {
    await expect(page.locator('h2').last()).toContainText(i18next.t('homepage.databus_definition'))
  })

  test('homepage displays bus illustration', async ({ page }) => {
    const img = page.locator('img[alt="Public Transportaion Bus Illustration"]')
    await expect(img).toBeVisible()
  })

  test('homepage displays navigation links to main pages', async ({ page }) => {
    const links = page.locator('section.links .page-link')
    const count = await links.count()
    expect(count).toBe(6)
  })

  test('homepage displays copyright footer', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText(i18next.t('homepage.copyright'))
  })

  test('mobile menu link is hidden on desktop', async ({ page }) => {
    const mobileSection = page.locator('section.hideOnDesktop')
    await expect(mobileSection).toBeHidden()
  })

  test('desktop links section is visible on desktop', async ({ page }) => {
    const desktopSection = page.locator('section.hideOnMobile')
    await expect(desktopSection).toBeVisible()
  })
})
