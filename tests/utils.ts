import { exec } from 'child_process'
import { Locator, Page } from '@playwright/test'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { test as baseTest, customMatcher, Matcher } from 'playwright-advanced-har'
import { RouteFromHAROptions } from 'playwright-advanced-har/lib/utils/types'
import { expect } from 'playwright-assertions'
import dayjs from 'src/dayjs'
import { PAGES } from 'src/routes'

export { expect } from 'playwright-assertions'

export const test = baseTest

export function getPastDate() {
  return new Date('2024-02-12T15:00:00+00:00')
}

export function getPastTrainDate() {
  return new Date('2026-02-12T15:00:00+00:00')
}

const urlMatcher: Matcher = customMatcher({
  urlComparator(a, b) {
    const paramsToIgnore = new Set(['t', 'limit', 'date_from', 'date_to'])
    // Coordinate bounds come from geolib's floating-point math, whose last digits
    // can shift between library versions — which would break exact URL matching.
    // Round them so the HAR match is stable across geolib bumps.
    // (6 decimals ≈ 11cm, far finer than the source stop data and the 500m box.)
    const floatParams = new Set([
      'lat__greater_or_equal',
      'lat__lower_or_equal',
      'lon__greater_or_equal',
      'lon__lower_or_equal',
    ])
    function normalize(url: string) {
      const urlObj = new URL(url)
      for (const param of paramsToIgnore) {
        urlObj.searchParams.delete(param)
      }
      for (const param of floatParams) {
        const value = urlObj.searchParams.get(param)
        if (value !== null) {
          urlObj.searchParams.set(param, Number(value).toFixed(6))
        }
      }
      const sortedParams = Array.from(urlObj.searchParams.entries()).sort(([a], [b]) =>
        a.localeCompare(b),
      )
      urlObj.search = new URLSearchParams(sortedParams).toString()
      urlObj.pathname = urlObj.pathname.replace(/\/$/, '')
      return urlObj.toString()
    }

    return normalize(a) === normalize(b)
  },
})

export const getBranch = async (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`getBranch Error: ${err.message || err.name}`))
      } else if (typeof stdout === 'string' && stdout.trim()) {
        resolve(stdout.trim())
      } else {
        reject(new Error(`getBranch Error: No branch name found. Stderr: ${stderr}`))
      }
    })
  })
}

/**
 * Wait until the Leaflet map stops moving. The recenter effect pans the map as
 * vehicle-position batches stream in, so marker screen coordinates are not
 * trustworthy (clicks can miss) until the pane's transform stays unchanged
 * between two consecutive samples.
 */
export const waitForMapIdle = async (page: Page) => {
  let previousTransform = ''
  await expect(async () => {
    const transform = await page
      .locator('.leaflet-map-pane')
      .evaluate((el) => (el as HTMLElement).style.transform)
    const stable = transform !== '' && transform === previousTransform
    previousTransform = transform
    expect(stable).toBe(true)
  }).toPass({ timeout: 15000, intervals: [500] })
}

export const waitForSkeletonsToHide = async (page: Page) => {
  // matches both the legacy antd skeleton and the MUI-based SkeletonLoader
  const skeletons = page.locator('.ant-skeleton-content, [data-testid="skeleton-loader"]')
  while ((await skeletons.count()) > 0) {
    await skeletons.last().waitFor({ state: 'hidden' })
  }
}

export const fillDateField = async (
  page: Page,
  label: string,
  value: string = getPastDate().toLocaleDateString('en-GB'),
) => {
  const field = page.getByRole('group', { name: label }).first()
  const [day, month, year] = value.split('/')
  const sections = field.getByRole('spinbutton')

  await field.waitFor()
  await sections.nth(0).fill(day.padStart(2, '0'))
  await sections.nth(1).fill(month.padStart(2, '0'))
  await sections.nth(2).fill(year)
  await sections.nth(2).press('Tab')
}

export const clearInputField = async (input: Locator) => {
  const clearIndicator = input.locator('..').locator('.clear-indicator').first()
  await input.hover()
  await input.click()
  await clearIndicator.waitFor({ state: 'visible' })
  await clearIndicator.click()
}

/**
 * Let the document itself grow to the full content height, so a full-page capture
 * really covers the whole page.
 *
 * The app shell pins the layout to the viewport and scrolls inside `#main-content`
 * (`.main` and `#main-content` in src/layout/index.tsx), so `documentElement.scrollHeight`
 * always equals the viewport height — and a full-page capture is therefore identical to a
 * viewport one. Applitools' `scrollRootElement` does not help: the Ultrafast Grid forwards
 * it for native devices only, so a web render always measures the document.
 *
 * Must be registered before the first navigation — the style is re-applied on every one.
 */
export const unlockFullPageScroll = async (page: Page) => {
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.textContent = `
      .main { height: auto !important; overflow: visible !important; }
      #main-content { overflow: visible !important; }
    `
    const attach = () => document.head.appendChild(style)
    if (document.head) {
      attach()
    } else {
      document.addEventListener('DOMContentLoaded', attach)
    }
  })
}

export const setupTest = async (page: Page, lng: string = 'he') => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  await page.route(/api\.github\.com/, (route) => route.abort())
  await page.route(/open-bus-backend\.k8s\.hasadna\.org\.il/, (route) => route.abort())
  await page.route(/.*openstreetmap*/, (route) => route.abort())
  // Abort stride-api requests during initial navigation. Tests that need stride-api data
  // should call advancedRouteFromHAR AFTER setupTest - the HAR route handler takes precedence
  // over this abort route (Playwright evaluates routes in reverse registration order).
  await page.route(/stride-api/, (route) => route.abort())
  await page.clock.setSystemTime(getPastDate())
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await i18next.use(Backend).init({ lng, backend: { loadPath: 'src/locale/{{lng}}.json' } })
  await page.goto('/')
  await page.locator('.preloader').waitFor({ state: 'hidden' })
}

/**
 * The sidebar splits its pages across data/community tabs, so a page's link is only in
 * the DOM while its own tab is selected. Rather than mirror the section table here (which
 * would need updating every time a page moves between tabs), try each tab until the link
 * appears.
 */
const openSidebarSectionOf = async (page: Page, link: Locator) => {
  if (await link.count()) return
  // `:visible` because the sider and the mobile drawer each render a menu, and only one
  // of them is on screen at a time.
  for (const tab of await page.locator('.sidebar-menu:visible').getByRole('tab').all()) {
    await tab.click()
    if (await link.count()) return
  }
}

export const visitPage = async (page: Page, label: (typeof PAGES)[number]['label']) => {
  // Scoped to the nav: the homepage repeats several of these labels on its own link
  // cards, so an unscoped name match would resolve to two elements.
  const link = page
    .locator('.sidebar-menu')
    .getByRole('link', { name: i18next.t(label), exact: true })
  await openSidebarSectionOf(page, link)
  const href = await link.getAttribute('href')
  // Register waitForURL before clicking to avoid missing fast client-side navigations
  const navigationPromise = href
    ? page.waitForURL((url) => url.pathname === href)
    : Promise.resolve()
  await link.click()
  await navigationPromise
  await page.waitForTimeout(500)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForLoadState('networkidle')
}

export const verifyDateFromParameter = async (page: Page) => {
  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('gtfs_agencies/list'),
  )

  await page.reload()
  await page.getByLabel('חברה מפעילה').click()
  const request = await requestPromise

  const dateFrom = dayjs(new URL(request.url()).searchParams.get('date_from'))
  const daysAgo = dayjs(getPastDate()).diff(dateFrom, 'days')

  expect(daysAgo).toBeGreaterThanOrEqual(0)
  expect(daysAgo).toBeLessThanOrEqual(3)
}

export const harOptions: RouteFromHAROptions = {
  notFound: 'abort',
  url: /stride-api/,
  matcher: urlMatcher,
}
