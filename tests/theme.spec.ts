import i18next from 'i18next'
import { expect, setupTest, test } from './utils'

test.describe('theme persistence', () => {
  test('dark mode preference persists across reloads via localStorage', async ({ page }) => {
    // setupTest lands on '/', a static page rendered inside the global layout.
    await setupTest(page)

    // The toggle shows "go to dark" while light and "go to light" while dark.
    const goDark = i18next.t('dark_mode_tooltip')
    const goLight = i18next.t('light_mode_tooltip')

    // Assert the page surface actually repaints through antd's theme engine, not just
    // that a class flipped. antd paints bodyBg on the Layout (.main); #main-content
    // (Content) is transparent, so the themed color lives on .main.
    const mainBg = () =>
      page.evaluate(() => getComputedStyle(document.querySelector('.main')!).backgroundColor)
    const stored = () => page.evaluate(() => localStorage.getItem('isDarkTheme'))

    await expect(page.getByLabel(goDark)).toBeVisible()
    const lightBg = await mainBg()

    await page.getByLabel(goDark).click()
    await expect(page.getByLabel(goLight)).toBeVisible()
    const darkBg = await mainBg()
    expect(darkBg).not.toBe(lightBg)
    expect(await stored()).toBe('true')

    // The one reload that matters: a fresh boot must re-read the preference from
    // localStorage (not prefers-color-scheme) and repaint the surface dark.
    await page.reload()
    await page.locator('.preloader').waitFor({ state: 'hidden' })
    await expect(page.getByLabel(goLight)).toBeVisible()
    expect(await mainBg()).toBe(darkBg)

    // Toggling back repaints light and writes the opposite value (no reboot needed).
    await page.getByLabel(goLight).click()
    await expect(page.getByLabel(goDark)).toBeVisible()
    expect(await mainBg()).toBe(lightBg)
    expect(await stored()).toBe('false')
  })
})
