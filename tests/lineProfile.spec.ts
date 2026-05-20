import { expect, setupTest, test } from './utils'

test.describe('Line Profile', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('shows not-found message when route id is invalid', async ({ page }) => {
    await page.goto('/profile/not-a-valid-id')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('לא הצלחנו למצוא את הקו שחיפשת :(')).toBeVisible()
  })

  test('shows not-found message when route id does not exist', async ({ page }) => {
    // stride-api is blocked by setupTest so any numeric id will fail with a network error
    await page.goto('/profile/9999999')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('לא הצלחנו למצוא את הקו שחיפשת :(')).toBeVisible()
  })

  test('assets load correctly on profile nested route', async ({ page }) => {
    await page.goto('/profile/9999999')
    await page.waitForLoadState('networkidle')

    const scriptSrcs = await page
      .locator('script[src]')
      .evaluateAll((scripts) => scripts.map((s) => s.getAttribute('src')))

    const internalScripts = scriptSrcs.filter(
      (src) => src && src.startsWith('/') && !src.startsWith('http'),
    )
    expect(internalScripts.length).toBeGreaterThan(0)

    for (const src of internalScripts) {
      // asset paths must be absolute, not relative to /profile/*
      expect(src!.startsWith('/')).toBeTruthy()
      expect(src!.startsWith('/profile/')).toBeFalsy()
    }
  })
})
