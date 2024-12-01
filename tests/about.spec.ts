import { test, expect } from './utils'
test.describe('About Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    advancedRouteFromHAR('tests/HAR/clearbutton.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'fallback',
      url: /stride-api/,
    })
  })

  test('after clicking "about" menu item, user should redirect to "about" page', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByText('אודות').click()
    await expect(page).toHaveURL(/about/)
    const locator = page.locator('li').filter({ hasText: 'אודות' })
    await expect(locator).toHaveClass(/menu-item-selected/)
  })
  test('page title should be `מהו אתר “דאטאבוס”?`', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: 'מהו אתר “דאטאבוס”?' })).toBeVisible()
  })
  test('clicking dontaions link should lead to "sadna" site', async ({ page }) => {
    await page.goto('/about')
    await page.getByRole('link', { name: 'תרומות קטנות נוספות' }).click()
    await page.getByRole('heading', { name: 'הסדנא לידע ציבורי פותחת ומנגישה מידע' }).waitFor()
  })

  test('clicking the links under "privacy" should lead to Google analytics', async ({ page }) => {
    await page.goto('/')
    await page.getByText('אודות').click()
    await page.getByRole('link', { name: 'Google Analytics' }).click()
    await expect(page).toHaveURL('https://marketingplatform.google.com/about/analytics/')
    await page.goto('/')
    await page.getByText('אודות').click()
    await page.getByRole('link', { name: 'קראו כאן' }).click()
    await expect(page).toHaveURL(/support\.google\.com\/analytics\/answer\/6004245\?hl=iw/)
  })

  test('clicking the links under "user license" should lead to creativecommons.org', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'אודות' }).click()
    await page.getByRole('link', { name: 'רישיון CC BY-SA' }).click()
    await expect(page).toHaveURL('https://creativecommons.org/licenses/by-sa/4.0/')
    await page.goto('/about')
    await page.getByRole('link', { name: 'Creative Commons' }).click()
    await expect(page).toHaveURL('https://creativecommons.org/')
  })

  test('clicking the links under "questions" should lead to the correct contact ways', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'אודות' }).click()
    await page.getByRole('link', { name: 'צרו איתנו קשר' }).click()
    await expect(page).toHaveURL('https://www.hasadna.org.il/צור-קשר/')
    await page.goto('/about')
    await page.getByRole('link', { name: 'דברו איתנו על זה בסלאק' }).click()
    await expect(page).toHaveURL(
      'https://hasadna.slack.com/join/shared_invite/zt-167h764cg-J18ZcY1odoitq978IyMMig#/shared-invite/email',
    )
    await page.goto('/about')
    await page
      .getByRole('link', { name: 'שרתים עולים כסף - עזרו לנו להמשיך לתחזק ולפתח את הפרויקט!' })
      .click()
    await expect(page).toHaveURL(
      'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
    )
  })

  test('links under "Funding" should lead to OpenAPI and donations sites', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'אודות' }).click()
    await page.getByRole('link', { name: 'Open API' }).click()
    await page.getByRole('heading', { name: 'Open Bus Stride API' }).waitFor()
    await page.goto('/about')
    await page.getByRole('link', { name: 'ותרומות קטנות נוספות של ידידי ואוהדי הסדנא' }).click()
    await expect(page).toHaveURL(
      'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
    )
  })

  test('links under "Attributions" should lead to the attr origins', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'אודות' }).click()
    await page.getByRole('link', { name: 'Applitools' }).click()
    await expect(page).toHaveURL('https://applitools.com/')
    await page.goto('/about')
    const page1Promise = page.waitForEvent('popup')
    await page.getByRole('link', { name: 'pch.vector' }).click()
    const page1 = await page1Promise
    await expect(page1).toHaveURL(
      'https://www.freepik.com/free-vector/passengers-waiting-bus-city-queue-town-road-flat-vector-illustration-public-transport-urban-lifestyle_10173277.htm#query=public%20transportation&position=0&from_view=search&track=ais&uuid=70a79b38-20cb-42b8-9dde-b96a68088522',
    )
    await page.goto('https://github.com/hasadna/open-bus-map-search/blob/main/CONTRIBUTING.md')
    await page.goto('/about')
    await page.getByRole('link', { name: 'קרא כאן' }).click()
    await expect(page).toHaveURL(
      'https://github.com/hasadna/open-bus-map-search/blob/main/CONTRIBUTING.md',
    )
  })
})
