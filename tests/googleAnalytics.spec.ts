import { expect, setupTest, test, visitPage } from './utils'

// Keep in sync with the measurement id passed to ReactGA.initialize in src/index.tsx
const GA_MEASUREMENT_ID = 'G-0YRQT80GG1'

// react-ga4 pushes every gtag call onto window.dataLayer as an arguments object,
// e.g. ['js', Date], ['config', 'G-...'], ['event', 'page_view', {...}].
type DataLayerEntry = unknown[]
const readDataLayer = (page: Parameters<typeof setupTest>[0]) =>
  page.evaluate(() => {
    const w = window as unknown as { dataLayer?: ArrayLike<unknown>[] }
    return Array.isArray(w.dataLayer) ? w.dataLayer.map((a) => Array.from(a)) : null
  }) as Promise<DataLayerEntry[] | null>

const countPageviews = (dataLayer: DataLayerEntry[] | null) =>
  (dataLayer ?? []).filter((e) => e.includes('page_view')).length

/**
 * Regression guard for the Google Analytics integration.
 *
 * Background: react-ga4 is a CommonJS module whose real export is nested under
 * `.default`. Under some bundler interop (Vite/Rolldown) `import ReactGA from 'react-ga4'`
 * resolved to the module namespace instead, so `ReactGA.initialize`/`ReactGA.send` were
 * `undefined` and GA silently died with "ReactGA.initialize is not a function".
 * These tests assert GA actually initializes and tracks pageviews — independent of the
 * network (setupTest aborts the real GA endpoints, but react-ga4 still populates
 * window.dataLayer itself), so they are CI-safe and never send real hits.
 */
test.describe('Google Analytics', () => {
  test('initializes and records a pageview on load, without throwing', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // setupTest aborts googletagmanager.com / google-analytics.com requests.
    await setupTest(page)

    // react-ga4 installs the gtag shim regardless of the external script loading.
    expect(
      await page.evaluate(() => typeof (window as unknown as { gtag?: unknown }).gtag),
      'react-ga4 should define window.gtag',
    ).toBe('function')

    const dataLayer = await readDataLayer(page)
    expect(dataLayer, 'window.dataLayer should be initialized by react-ga4').not.toBeNull()

    // A 'config' entry proves ReactGA.initialize() ran (src/index.tsx) — the exact call
    // the broken import turned into "is not a function".
    expect(
      dataLayer!.some((e) => e[0] === 'config' && e[1] === GA_MEASUREMENT_ID),
      `dataLayer should contain a config for ${GA_MEASUREMENT_ID}`,
    ).toBe(true)

    // A 'page_view' event proves ReactGA.send() ran (src/routes/MainRoute.tsx).
    expect(countPageviews(dataLayer), 'dataLayer should contain a page_view event').toBeGreaterThan(
      0,
    )

    // The specific failure mode: a broken import makes initialize/send throw, which the
    // app catches and logs. Assert none of those happened.
    const gaErrors = consoleErrors.filter((e) =>
      /Failed to initialize Google Analytics|ReactGA\.\w+ is not a function/.test(e),
    )
    expect(gaErrors, 'GA must initialize/send without throwing').toEqual([])
  })

  test('sends an additional pageview on client-side navigation', async ({ page }) => {
    await setupTest(page)
    const before = countPageviews(await readDataLayer(page))

    // Real in-app (SPA) navigation via a menu link — exercises MainRoute's pageview effect.
    await visitPage(page, 'timeline_page_title')

    await expect
      .poll(async () => countPageviews(await readDataLayer(page)), {
        message: 'a pageview should be recorded after client-side navigation',
      })
      .toBeGreaterThan(before)
  })
})
