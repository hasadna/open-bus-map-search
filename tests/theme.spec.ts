import i18next from 'i18next'
import { expect, setupTest, test, visitPage } from './utils'

// About's VersionInfo fetches this on mount; abort it so the page settles fast.
const VERSION_URL = 'https://open-bus-map-search.hasadna.org.il/hash.txt'

test.describe('theme persistence', () => {
  test('dark mode preference persists across reloads via localStorage', async ({ page }) => {
    await page.route(VERSION_URL, (route) => route.abort())
    await setupTest(page)
    // The theme toggle lives in the global header; About is a light page to host the check.
    await visitPage(page, 'about_title')

    // The toggle shows "go to dark" while light and "go to light" while dark.
    const goDark = i18next.t('dark_mode_tooltip')
    const goLight = i18next.t('light_mode_tooltip')

    const isDark = () => page.evaluate(() => document.body.classList.contains('dark'))
    const stored = () => page.evaluate(() => localStorage.getItem('isDarkTheme'))

    await expect(page.getByLabel(goDark)).toBeVisible()
    expect(await isDark()).toBe(false)

    await page.getByLabel(goDark).click()
    await expect(page.getByLabel(goLight)).toBeVisible()
    expect(await isDark()).toBe(true)
    expect(await stored()).toBe('true')

    await page.reload()
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await expect(page.getByLabel(goLight)).toBeVisible()
    expect(await isDark()).toBe(true)

    await page.getByLabel(goLight).click()
    expect(await stored()).toBe('false')
    await page.reload()
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await expect(page.getByLabel(goDark)).toBeVisible()
    expect(await isDark()).toBe(false)
  })
})
