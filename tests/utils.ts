/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import moment from 'moment'
import { Matcher, test as baseTest, customMatcher } from 'playwright-advanced-har'

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex')
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
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
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)),
      )
    }
  },
})

export function getPastDate(): Date {
  return moment('2024-02-12 15:00:00').toDate()
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
