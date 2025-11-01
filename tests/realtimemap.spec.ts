import { expect, getPastDate, setupTest, test, urlMatcher, visitPage } from './utils'

const TOOLTIP_CONTENT_ITEMS = [
  'שם חברה מפעילה:',
  'מוצא:',
  'יעד:',
  'מהירות:',
  'זמן דגימה:',
  'לוחית רישוי:',
  'כיוון נסיעה:',
  'נ.צ.:',
]

test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
  await setupTest(page)
  await page.clock.setSystemTime(getPastDate())
  await advancedRouteFromHAR('tests/HAR/realtimemap.har', {
    updateContent: 'embed',
    update: false,
    notFound: 'fallback',
    url: /stride-api/,
    matcher: urlMatcher,
  })
  await visitPage(page, 'מפה לפי זמן', /map/)
})
test('time-based-map page', async ({ page }) => {
  await page.getByLabel('תאריך').fill(new Date().toLocaleDateString('en-GB'))
  await page.getByLabel('דקות').fill('6')
})

test('tooltip appears after clicking on map point', async ({ page }) => {
  await test.step('Click on a bus button', async () => {
    const button = page.getByRole('button', { name: 'אגד אגד' })
    await button.click()
    await button.click({ force: true })
  })

  await test.step('Click inside the tooltip', async () => {
    await page.getByRole('button', { name: 'הצג מידע לגיקים' }).click()
    await page.getByRole('button', { name: 'הסתר מידע לגיקים' }).click()
  })

  await test.step('Expecting the tooltip to have the correct content', async () => {
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
    expect(textList).toEqual(TOOLTIP_CONTENT_ITEMS)
  })
})
