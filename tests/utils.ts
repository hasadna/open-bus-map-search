/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { Matcher, test as baseTest, customMatcher } from 'playwright-advanced-har'
import { BrowserContext, Page } from '@playwright/test'
import { exec } from 'child_process'

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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          super(fakeNow)
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
      if (err) reject(`getBranch Error: ${err}`)
      else if (typeof stdout === 'string') resolve(stdout.trim())
    })
  })

export const expect = test.expect
