import { expect, setupTest, test, visitPage } from './utils'

// Mock navigator.clipboard before every test so we can inspect what the share
// button writes without touching the real system clipboard.
const mockClipboard = async ({ page }: { page: Parameters<typeof setupTest>[0] }) => {
  await page.addInitScript(() => {
    const mock = {
      writeText: (text: string) => {
        ;(window as { __clipboardText?: string }).__clipboardText = text
        return Promise.resolve()
      },
      readText: () =>
        Promise.resolve((window as { __clipboardText?: string }).__clipboardText ?? ''),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as Clipboard
    Object.defineProperty(navigator, 'clipboard', { value: mock, configurable: true })
  })
}

const getClipboard = (page: Parameters<typeof setupTest>[0]) =>
  page.evaluate(() => (window as { __clipboardText?: string }).__clipboardText ?? '')

test.describe('Share URL feature', () => {
  test.beforeEach(async ({ page }) => {
    await mockClipboard({ page })
    await setupTest(page)
  })

  // -------------------------------------------------------------------------
  // Share button presence
  // -------------------------------------------------------------------------

  test('share button is visible in the header on homepage', async ({ page }) => {
    await expect(page.locator('[aria-label="העתק קישור"]')).toBeVisible()
  })

  test('share button is visible after navigating to gaps page', async ({ page }) => {
    await visitPage(page, 'gaps_page_title')
    await expect(page.locator('[aria-label="העתק קישור"]')).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // URL param stripping
  // -------------------------------------------------------------------------

  test('URL params are stripped from the address bar after page load', async ({ page }) => {
    await page.goto('/gaps?date=2024-02-12&operatorId=3&lineNumber=64')
    await page.waitForURL((url) => !url.search)
    expect(new URL(page.url()).search).toBe('')
  })

  test('address bar shows clean path after loading with params', async ({ page }) => {
    await page.goto('/timeline?date=2024-02-12&operatorId=5&lineNumber=18')
    await page.waitForURL((url) => !url.search)
    expect(new URL(page.url()).pathname).toMatch(/\/timeline$/)
    expect(new URL(page.url()).search).toBe('')
  })

  // -------------------------------------------------------------------------
  // Round-trip: share URL restores state
  // -------------------------------------------------------------------------

  // Navigate with URL params → MainRoute seeds SearchContext and strips params
  // from the address bar → clicking Share rebuilds the URL from SearchContext
  // and writes it to clipboard. The clipboard URL must contain the original params.

  test('round-trip: gaps page share button writes correct URL to clipboard', async ({ page }) => {
    await page.goto('/gaps?date=2024-02-12&operatorId=3&lineNumber=64')
    await page.waitForURL((url) => !url.search)
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    await page.locator('[aria-label="העתק קישור"]').click()

    const clipUrl = await getClipboard(page)
    const params = new URL(clipUrl).searchParams
    expect(params.get('date')).toBe('2024-02-12')
    expect(params.get('operatorId')).toBe('3')
    expect(params.get('lineNumber')).toBe('64')
  })

  test('round-trip: timeline page share button writes correct URL to clipboard', async ({
    page,
  }) => {
    await page.goto('/timeline?date=2024-02-12&operatorId=5&lineNumber=18')
    await page.waitForURL((url) => !url.search)
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    await page.locator('[aria-label="העתק קישור"]').click()

    const clipUrl = await getClipboard(page)
    const params = new URL(clipUrl).searchParams
    expect(params.get('date')).toBe('2024-02-12')
    expect(params.get('operatorId')).toBe('5')
    expect(params.get('lineNumber')).toBe('18')
  })

  // -------------------------------------------------------------------------
  // Per-page share URL content
  // -------------------------------------------------------------------------

  test('homepage share URL has no query params', async ({ page }) => {
    await page.locator('[aria-label="העתק קישור"]').click()
    const clipUrl = await getClipboard(page)
    expect(new URL(clipUrl).search).toBe('')
    expect(new URL(clipUrl).pathname).toBe('/')
  })

  test('velocity heatmap share URL includes date', async ({ page }) => {
    await visitPage(page, 'velocity_heatmap_page_title')
    await page.locator('[aria-label="העתק קישור"]').click()
    const clipUrl = await getClipboard(page)
    const params = new URL(clipUrl).searchParams
    expect(params.has('date')).toBe(true)
    expect(/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') ?? '')).toBe(true)
  })

  test('share URL pathname has no language prefix', async ({ page }) => {
    await visitPage(page, 'gaps_page_title')
    await page.locator('[aria-label="העתק קישור"]').click()
    const clipUrl = await getClipboard(page)
    const { pathname } = new URL(clipUrl)
    expect(pathname).toBe('/gaps')
  })

  // -------------------------------------------------------------------------
  // Line profile — startTime in extra params
  // -------------------------------------------------------------------------

  test('line profile not-found page share URL has no query params', async ({ page }) => {
    await page.goto('/profile/not-a-valid-id')
    await page.waitForLoadState('networkidle')
    await page.locator('[aria-label="העתק קישור"]').click()
    const clipUrl = await getClipboard(page)
    // Without startTime selected, extra params are empty — only path
    expect(new URL(clipUrl).pathname).toMatch(/\/profile\//)
    expect(new URL(clipUrl).searchParams.has('operatorId')).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Per-page state params in the share URL
  // -------------------------------------------------------------------------
  // These pages keep view state (only-gaps toggle, date range, operator,
  // day/hour grouping) in per-page state (usePageState). A shared link must
  // round-trip those params: seed from the URL → register in the share context
  // → the Share button rebuilds an identical URL.

  test("round-trip: gaps page share URL includes the 'only gaps' toggle", async ({ page }) => {
    await page.goto('/gaps?date=2024-02-12&operatorId=3&lineNumber=64&onlyGapped=true')
    await page.waitForURL((url) => !url.search)
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    await page.locator('[aria-label="העתק קישור"]').click()
    const params = new URL(await getClipboard(page)).searchParams
    expect(params.get('onlyGapped')).toBe('true')
    // global fields still ride along
    expect(params.get('date')).toBe('2024-02-12')
    expect(params.get('operatorId')).toBe('3')
  })

  test('round-trip: dashboard share URL includes date range and operator', async ({ page }) => {
    await page.goto(
      '/dashboard?startDate=2024-02-01T00:00:00.000Z&endDate=2024-02-08T00:00:00.000Z&operatorId=3',
    )
    await page.waitForURL((url) => !url.search)
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    await page.locator('[aria-label="העתק קישור"]').click()
    const params = new URL(await getClipboard(page)).searchParams
    expect(params.get('operatorId')).toBe('3')
    expect(params.get('startDate')).toBe('2024-02-01T00:00:00.000Z')
    expect(params.get('endDate')).toBe('2024-02-08T00:00:00.000Z')
  })

  test('round-trip: data research share URL includes day/hour grouping and operator', async ({
    page,
  }) => {
    await page.goto('/data-research?groupByHour=true&operatorId=3')
    await page.waitForURL((url) => !url.search)
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    await page.locator('[aria-label="העתק קישור"]').click()
    const params = new URL(await getClipboard(page)).searchParams
    expect(params.get('groupByHour')).toBe('true')
    expect(params.get('operatorId')).toBe('3')
  })
})
