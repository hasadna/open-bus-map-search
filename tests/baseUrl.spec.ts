import { expect, setupTest, test } from './utils'

test.describe('Base URL configuration tests', () => {
  test('assets should load from root path on nested routes', async ({ page }) => {
    await setupTest(page)

    // Navigate to a nested route (e.g., /profile/:id)
    // We'll use a direct navigation to simulate the issue scenario
    await page.goto('/profile/8235701')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that JavaScript assets are loaded from the correct path
    const scriptTags = await page.locator('script[src]').all()
    const scriptSources = await Promise.all(scriptTags.map((tag) => tag.getAttribute('src')))

    // Filter for asset files (typically in /assets/ directory)
    const assetScripts = scriptSources.filter((src) => src && src.includes('/assets/'))

    // Verify that we found asset scripts to test
    expect(assetScripts.length).toBeGreaterThan(0)

    // Verify that asset paths start with /assets/ (from root) and not /profile/assets/
    for (const src of assetScripts) {
      if (src) {
        expect(src.startsWith('/assets/')).toBeTruthy()
        expect(src.startsWith('/profile/assets/')).toBeFalsy()
      }
    }

    // Also verify that all script resources loaded successfully (no 404s)
    const failedRequests: string[] = []
    page.on('requestfailed', (request) => {
      if (request.resourceType() === 'script') {
        failedRequests.push(request.url())
      }
    })

    // Reload the page to trigger all resource loads again
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check that no script requests failed
    expect(failedRequests.length).toBe(0)
  })

  test('assets should load correctly on dashboard page', async ({ page }) => {
    await setupTest(page)

    // Navigate to dashboard (a top-level route)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Check that JavaScript assets are loaded from the correct path
    const scriptTags = await page.locator('script[src]').all()
    const scriptSources = await Promise.all(scriptTags.map((tag) => tag.getAttribute('src')))

    // Filter for asset files
    const assetScripts = scriptSources.filter((src) => src && src.includes('/assets/'))

    // Verify that we found asset scripts to test
    expect(assetScripts.length).toBeGreaterThan(0)

    // Verify that asset paths start with /assets/ (from root)
    for (const src of assetScripts) {
      if (src) {
        expect(src.startsWith('/assets/')).toBeTruthy()
      }
    }
  })

  test('CSS assets should load from root path on nested routes', async ({ page }) => {
    await setupTest(page)

    // Navigate to a nested route
    await page.goto('/profile/8235701')
    await page.waitForLoadState('networkidle')

    // Check that CSS assets are loaded from the correct path
    const linkTags = await page.locator('link[rel="stylesheet"]').all()
    const linkHrefs = await Promise.all(linkTags.map((tag) => tag.getAttribute('href')))

    // Filter for asset files
    const assetLinks = linkHrefs.filter((href) => href && href.includes('/assets/'))

    // Verify that we found asset links to test
    expect(assetLinks.length).toBeGreaterThan(0)

    // Verify that asset paths start with /assets/ (from root) and not /profile/assets/
    for (const href of assetLinks) {
      if (href) {
        expect(href.startsWith('/assets/')).toBeTruthy()
        expect(href.startsWith('/profile/assets/')).toBeFalsy()
      }
    }
  })
})
