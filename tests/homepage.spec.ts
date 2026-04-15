import i18next from 'i18next'
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

  test('welcome message contains expected Hebrew text', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(i18next.t('homepage.welcome'))
    await expect(page.locator('h2')).toContainText(i18next.t('homepage.databus_definition'))
    await expect(page.getByText(i18next.t('homepage.website_goal'))).toBeVisible()
  })

  test('each navigation link points to correct href', async ({ page }) => {
    const linkData = [
      { label: i18next.t('singleline_map_page_title'), href: '/single-line-map' },
      { label: i18next.t('timeline_page_title'), href: '/timeline' },
      { label: i18next.t('gaps_page_title'), href: '/gaps' },
      { label: i18next.t('gaps_patterns_page_title'), href: '/gaps_patterns' },
      { label: i18next.t('operator_title'), href: '/operator' },
      { label: i18next.t('time_based_map_page_title'), href: '/map' },
    ]

    for (const { label, href } of linkData) {
      const linkContainer = page.locator('.page-link', { hasText: label })
      const anchor = linkContainer.locator('a')
      await expect(anchor).toHaveAttribute('href', href)
    }
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
