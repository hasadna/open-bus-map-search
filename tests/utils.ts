/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import moment from 'moment'
import { Matcher, test as baseTest, customMatcher } from 'playwright-advanced-har'
import { BrowserContext, Page } from '@playwright/test'

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex')
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- window will always stay `any`, see: https://github.com/hasadna/open-bus-map-search/issues/450#issuecomment-1931862354
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)),
      ),
    )
    await setBrowserTime(getPastDate(), context)
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true })
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      if (coverageJSON)
        fs.writeFileSync(
          path.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`),
          coverageJSON,
        )
    })
    await use(context)
    for (const page of context.pages()) {
      await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- window will always stay `any`, see: https://github.com/hasadna/open-bus-map-search/issues/450#issuecomment-1931862354
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)),
      )
    }
  },
})

export function getPastDate(): Date {
  return moment('2024-02-12 15:00:00').toDate()
}

export async function setBrowserTime(date: Date, page: Page | BrowserContext) {
  const fakeNow = date.valueOf()

  // Update the Date accordingly
  await page.addInitScript(`{
    // Extend Date constructor to default to fakeNow
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(${fakeNow});
        } else {
          super(...args);
        }
      }
    }
    // Override Date.now() to start from fakeNow
    const __DateNowOffset = ${fakeNow} - Date.now();
    const __DateNow = Date.now;
    Date.now = () => __DateNow() + __DateNowOffset;
  }`)
}

export function urlMatcher(): Matcher {
  return customMatcher({
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
}

export const expect = test.expect
