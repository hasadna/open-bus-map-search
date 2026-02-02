import { expect, setupTest, test, visitPage } from '../utils'
import linkTests from './linksMetadata'

test.describe('About Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
    await visitPage(page, 'about_title')
  })

  test('after clicking "about" menu item, user should redirect to "about" page', async ({
    page,
  }) => {
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
