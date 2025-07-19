import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { exec } from 'child_process'
import { Matcher, test as baseTest, customMatcher } from 'playwright-advanced-har'
import { BrowserContext, Page } from '@playwright/test'
import { i18n } from 'i18next'
import Backend from 'i18next-fs-backend'

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context)
    for (const page of context.pages()) {
      await page.evaluate(() => {
        const w = window as CollectIstanbulCoverageWindow
        w.collectIstanbulCoverage(JSON.stringify(w.__coverage__))
      })
    }
  },
})

export function getPastDate(): Date {
  return new Date('2024-02-12 15:00:00')
}

export const urlMatcher: Matcher = customMatcher({
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

export const loadTranslate = async (i18next: i18n, lng: string = 'he') => {
  await i18next.use(Backend).init({
    lng,
    backend: { loadPath: 'src/locale/{{lng}}.json' },
  })
}

export const expect = test.expect
