import { expect, getPastDate, harOptions, setupTest, test } from './utils'

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
  await advancedRouteFromHAR('tests/HAR/realtimemap.har', harOptions)
  // Pin datetime to the instant realtimemap.har was recorded against
  // (2023-03-14T15:00Z == 17:00 Israel). Full page load so usePageState seeds
  // datetime from the URL on mount, decoupling the test from the page's default.
  await page.goto('/map?datetime=2023-03-14T17:00')
  await page.locator('.leaflet-marker-icon').first().waitFor({ state: 'visible' })
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
