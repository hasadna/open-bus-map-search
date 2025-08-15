import { test, expect, urlMatcher } from './utils'

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
  advancedRouteFromHAR('tests/HAR/realtimemap.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'abort',
    url: /stride-api/,
    matcher: urlMatcher,
  })
  await page.goto('/')
})
test('time-based-map page', async ({ page }) => {
  await page.getByText('מפה לפי זמן', { exact: true }).and(page.getByRole('link')).click()
  await page.waitForURL(/map/)
  await page.getByRole('progressbar').waitFor({ state: 'hidden' })
  await page.getByLabel('תאריך').fill(new Date().toLocaleDateString('en-GB'))
  await page.getByLabel('דקות').fill('6')
})

test('tooltip appears after clicking on map point', async ({ page }) => {
  await page.goto('/map')

  await test.step('Click on a bus button', async () => {
    await page.locator('.leaflet-container').click()
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: 'אגד אגד' }).click({ force: true })
    await page.waitForTimeout(500)
  })

  await test.step('Click inside the tooltip', async () => {
    await page.getByRole('button', { name: 'הצג מידע לגיקים' }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'הסתר מידע לגיקים' }).click()
  })

  await test.step('Expecting the tooltip to have the correct content', async () => {
    const contentItemsInOrder = [
      'שם חברה מפעילה:',
      'מוצא:',
      'יעד:',
      'מהירות:',
      'זמן דגימה:',
      'לוחית רישוי:',
      'כיוון נסיעה:',
      'נ.צ.:',
    ]
    const textList = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.content ul li'))
        .map((li) =>
          Array.from(li.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim() || ''),
        )
        .flat()
        .filter((value) => value !== '')
    })
    expect(textList).toEqual(contentItemsInOrder)
  })
})
