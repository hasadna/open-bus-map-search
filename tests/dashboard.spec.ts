import { customMatcher } from 'playwright-advanced-har'
import { test } from './utils'

test.describe('dashboard tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    advancedRouteFromHAR('tests/HAR/dashboard.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'abort',
      url: /stride-api/,
      matcher: customMatcher({
        urlComparator(a, b) {
          const fieldsToRemove = ['t', 'date_from', 'date_to']
          ;[a, b] = [a, b].map((url) => {
            const urlObj = new URL(url)
            fieldsToRemove.forEach((field) => urlObj.searchParams.delete(field))
            return urlObj.toString()
          })
          return a === b
        },
      }),
    })
    await page.goto('/')
    await page.getByText('הקווים הגרועים ביותר').waitFor()
    const skeletons = await page.locator('.ant-skeleton').all()
    await Promise.all(skeletons.map((skeleton) => skeleton.waitFor({ state: 'hidden' })))
  })

  test('page is working', async () => {})

  test('dark mode use localstorage', async ({ page }) => {
    await page.getByLabel('עבור למצב חשוך').click()
    await page.reload()
    await page.getByLabel('עבור למצב בהיר').click()
    await page.reload()
    await page.getByLabel('עבור למצב חשוך').click()
    await page.getByLabel('עבור למצב בהיר').click()
  })
})
