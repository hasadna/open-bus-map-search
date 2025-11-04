import { expect, setupTest, test, visitPage } from './utils'

const linkTests = [
  {
    name: 'donations link leads to sadna site',
    linkName: 'תרומות קטנות נוספות',
    expectedHeading: 'הסדנא לידע ציבורי פותחת ומנגישה מידע',
  },
  {
    name: 'Google Analytics link',
    linkName: 'Google Analytics',
    expectedURL: 'https://marketingplatform.google.com/about/analytics/',
  },
  {
    name: 'privacy read more link',
    linkName: 'קראו כאן',
    expectedURL: /support\.google\.com\/analytics\/answer\/6004245\?hl=iw/,
  },
  {
    name: 'CC BY-SA license link',
    linkName: 'רישיון CC BY-SA',
    expectedURL: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    name: 'Creative Commons link',
    linkName: 'Creative Commons',
    expectedURL: 'https://creativecommons.org/',
  },
  {
    name: 'contact link',
    linkName: 'צרו איתנו קשר',
    expectedURL: 'https://www.hasadna.org.il/צור-קשר/',
  },
  {
    name: 'Slack link',
    linkName: 'דברו איתנו על זה בסלאק',
    expectedURL:
      'https://hasadna.slack.com/join/shared_invite/zt-167h764cg-J18ZcY1odoitq978IyMMig#/shared-invite/email',
  },
  {
    name: 'servers donation link',
    linkName: 'שרתים עולים כסף - עזרו לנו להמשיך לתחזק ולפתח את הפרויקט!',
    expectedURL: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
  },
  {
    name: 'Open API link',
    linkName: 'Open API',
    expectedHeading: 'Open Bus Stride API',
  },
  {
    name: 'funding donations link',
    linkName: 'ותרומות קטנות נוספות של ידידי ואוהדי הסדנא',
    expectedURL: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
  },
  {
    name: 'Applitools link',
    linkName: 'Applitools',
    expectedURL: 'https://applitools.com/',
  },
  {
    name: 'contributing link',
    linkName: 'קרא כאן',
    expectedURL: 'https://github.com/hasadna/open-bus-map-search/blob/main/CONTRIBUTING.md',
  },
]

test.describe('About Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'אודות', /about/)
  })

  test('after clicking "about" menu item, user should redirect to "about" page', async ({
    page,
  }) => {
    await expect(page).toHaveURL(/about/)
    const locator = page.locator('li').filter({ hasText: 'אודות' })
    await expect(locator).toHaveClass(/menu-item-selected/)
  })

  test('page title should be `מהו אתר “דאטאבוס”?`', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'מהו אתר “דאטאבוס”?' })).toBeVisible()
  })

  for (const { name, linkName, expectedURL, expectedHeading } of linkTests) {
    test(`clicking ${name} leads to correct destination`, async ({ page }) => {
      await page.getByRole('link', { name: linkName }).click()
      if (expectedURL) {
        await expect(page).toHaveURL(expectedURL)
      }
      if (expectedHeading) {
        await page.getByRole('heading', { name: expectedHeading }).waitFor()
      }
    })
  }

  test('pch.vector link opens in popup with correct URL', async ({ page }) => {
    const page1Promise = page.waitForEvent('popup')
    await page.getByRole('link', { name: 'pch.vector' }).click()
    const page1 = await page1Promise
    await expect(page1).toHaveURL(
      'https://www.freepik.com/free-vector/passengers-waiting-bus-city-queue-town-road-flat-vector-illustration-public-transport-urban-lifestyle_10173277.htm#query=public%20transportation&position=0&from_view=search&track=ais&uuid=70a79b38-20cb-42b8-9dde-b96a68088522',
    )
  })

  test('the YouTube modal in "about" is visible and have the correct src', async ({ page }) => {
    const iframeElement = await page.waitForSelector('iframe')
    expect(iframeElement.isVisible())
    const videoSrc = page.locator('iframe')
    await expect(videoSrc).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/videoseries?si=oTULlxq8Is188hPu&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T',
    )
  })
})
