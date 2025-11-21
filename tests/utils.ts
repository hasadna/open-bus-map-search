import { exec } from 'child_process'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { BrowserContext, Page } from '@playwright/test'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { test as baseTest, customMatcher, Matcher } from 'playwright-advanced-har'
import { RouteFromHAROptions } from 'playwright-advanced-har/lib/utils/types'
import dayjs from 'src/dayjs'
import { PAGES } from 'src/routes'

type CollectIstanbulCoverageWindow = Window &
  typeof globalThis & {
    collectIstanbulCoverage: (coverage: string) => void
    __coverage__?: Record<string, unknown>
  }

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex')
}

export const test = baseTest.extend<{ context: BrowserContext }>({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      const w = window as CollectIstanbulCoverageWindow
      w.addEventListener('beforeunload', () => {
        w.collectIstanbulCoverage(JSON.stringify(w.__coverage__))
      })
    })
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true })
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      if (coverageJSON) {
        fs.writeFileSync(
          path.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`),
          coverageJSON,
        )
      }
    })
    await use(context)
    for (const page of context.pages()) {
      await page.evaluate(() => {
        const w = window as CollectIstanbulCoverageWindow
        w.collectIstanbulCoverage(JSON.stringify(w.__coverage__))
      })
    }
  },
})

export function getPastDate() {
  return new Date('2024-02-12T15:00:00+00:00')
}

const urlMatcher: Matcher = customMatcher({
  urlComparator(a, b) {
    const paramsToIgnore = new Set(['t', 'limit', 'date_from', 'date_to'])
    function normalize(url: string) {
      const urlObj = new URL(url)
      for (const param of paramsToIgnore) {
        urlObj.searchParams.delete(param)
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

export const waitForSkeletonsToHide = async (page: Page) => {
  while ((await page.locator('.ant-skeleton-content').count()) > 0) {
    await page.locator('.ant-skeleton-content').last().waitFor({ state: 'hidden' })
  }
}

export const setupTest = async (page: Page, lng: string = 'he') => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  await page.route(/api\.github\.com/, (route) => route.abort())
  await page.route(/.*openstreetmap*/, (route) => route.abort())
  await page.clock.setSystemTime(getPastDate())
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await i18next.use(Backend).init({ lng, backend: { loadPath: 'src/locale/{{lng}}.json' } })
  await page.goto('/')
  await page.locator('preloader').waitFor({ state: 'hidden' })
}

export const visitPage = async (page: Page, label: (typeof PAGES)[number]['label']) => {
  const link = page.getByText(i18next.t(label), { exact: true }).and(page.getByRole('link'))
  const href = await link.getAttribute('href')
  await link.click()
  if (href) await page.waitForURL(`**${href}`)
  await page.waitForTimeout(500)
  await page.locator('preloader').waitFor({ state: 'hidden' })
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
  updateContent: 'embed',
  update: false,
  notFound: 'fallback',
  url: /stride-api/,
  matcher: urlMatcher,
}

export const expect = test.expect
