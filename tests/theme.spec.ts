import i18next from 'i18next'
import { expect, setupTest, test } from './utils'

test.describe('theme persistence', () => {
  test('dark mode preference persists across reloads via localStorage', async ({ page }) => {
    // setupTest lands on '/', a static page with the theme toggle in the global header.
    await setupTest(page)

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
