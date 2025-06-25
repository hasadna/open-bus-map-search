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
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as CollectIstanbulCoverageWindow).collectIstanbulCoverage(
          JSON.stringify((window as CollectIstanbulCoverageWindow).__coverage__),
        ),
      ),
    )
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
      await page.evaluate(() =>
        (window as CollectIstanbulCoverageWindow).collectIstanbulCoverage(
          JSON.stringify((window as CollectIstanbulCoverageWindow).__coverage__),
        ),
      )
    }
  },
})

export function getPastDate(): Date {
  return new Date('2024-02-12 15:00:00')
}

export async function setBrowserTime(date: Date, page: Page | BrowserContext) {
  const fakeNow = date.valueOf()

  // Update the Date accordingly
  await page.addInitScript((fakeNow) => {
    // Extend Date constructor to default to fakeNow
    ;(window as any).Date = class extends (window as any).Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(fakeNow)
        } else {
          super(...args)
        }
      }
    }
    // Override Date.now() to start from fakeNow
    const __DateNowOffset = fakeNow - Date.now()
    const __DateNow = Date.now
    Date.now = () => __DateNow() + __DateNowOffset
  }, fakeNow)
}

export const urlMatcher: Matcher = customMatcher({
  urlComparator(a, b) {
    const fieldsToRemove = ['t', 'date_from', 'date_to']
    ;[a, b] = [a, b].map((url) => {
      const urlObj = new URL(url)
      fieldsToRemove.forEach((field) => urlObj.searchParams.delete(field))
      return urlObj.toString()
    })
    return a === b
  },
})

export const getBranch = () =>
  new Promise<string>((resolve, reject) => {
    return exec('git rev-parse --abbrev-ref HEAD', (err, stdout) => {
      if (err) reject(new Error(`getBranch Error: ${err.name}`))
      else if (typeof stdout === 'string') resolve(stdout.trim())
    })
  })

export const waitForSkeletonsToHide = async (page: Page) => {
  while ((await page.locator('.ant-skeleton-content').count()) > 0) {
    await page.locator('.ant-skeleton-content').last().waitFor({ state: 'hidden' })
  }
}

export const loadTranslate = async (i18next: i18n) => {
  await i18next.use(Backend).init({
    lng: 'he',
    fallbackLng: 'en',
    backend: {
      loadPath: 'src/locale/{{lng}}.json',
    },
  })
}

export const expect = test.expect
