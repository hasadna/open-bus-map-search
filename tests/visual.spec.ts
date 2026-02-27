import { test as eyesTest } from '@applitools/eyes-playwright/fixture'
import { mergeTests } from '@playwright/test'
import i18next from 'i18next'
import { test as baseTest, harOptions, setupTest, visitPage, waitForSkeletonsToHide } from './utils'

const test = mergeTests(baseTest, eyesTest)

test.beforeAll(() => {
  if (!process.env.APPLITOOLS_API_KEY) {
    console.log('APPLITOOLS_API_KEY is not defined, please ask noamgaash for the key')
    test.skip() // on forks, the secret is not available
  }
})

for (const mode of ['Light', 'Dark', 'LTR']) {
  test.describe(`Visual Tests - ${mode}`, () => {
    test.describe.configure({ retries: 0 })

    test.beforeEach(async ({ page }) => {
      await page.route(/.*youtube*/, (route) => route.abort())
      await setupTest(page, mode === 'LTR' ? 'en' : 'he')
      if (mode === 'Dark') {
        await page.getByLabel('עבור למצב כהה').first().click()
      }
      if (mode === 'LTR') {
        await page.getByRole('button', { name: 'החלף שפה' }).first().click()
        await page.getByRole('menuitem').filter({ hasText: 'English' }).click()
      }
    })

    test(`Home Page Should Look Good [${mode}]`, async ({ eyes }) => {
      await eyes.check('home page')
    })

    test(`Dashboard Page Should Look Good [${mode}]`, async ({
      page,
      advancedRouteFromHAR,
      eyes,
    }) => {
      await advancedRouteFromHAR('tests/HAR/dashboard.har', harOptions)
      await visitPage(page, 'dashboard_page_title')
      await page.getByText('אגד').first().waitFor()
      await waitForSkeletonsToHide(page)
      await eyes.check('dashboard page', {
        layoutRegions: ['.chart'],
        fully: true,
      })
    })

    test(`About Page Should Look Good [${mode}]`, async ({ page, eyes }) => {
      await visitPage(page, 'about_title')
      await eyes.check('about page')
    })

    test(`Timeline Page Should Look Good [${mode}]`, async ({
      page,
      advancedRouteFromHAR,
      eyes,
    }) => {
      await advancedRouteFromHAR('tests/HAR/timeline.har', harOptions)
      await visitPage(page, 'timeline_page_title')
      await eyes.check('timeline page')
    })

    test(`Gaps Page Should Look Good [${mode}]`, async ({ page, advancedRouteFromHAR, eyes }) => {
      await advancedRouteFromHAR('tests/HAR/missing.har', harOptions)
      await visitPage(page, 'gaps_page_title')
      await eyes.check('gaps page')
    })

    test(`Gaps Patterns Page Should Look Good [${mode}]`, async ({
      page,
      advancedRouteFromHAR,
      eyes,
    }) => {
      await advancedRouteFromHAR('tests/HAR/patterns.har', harOptions)
      await visitPage(page, 'gaps_patterns_page_title')
      await eyes.check('gaps_patterns page')
    })

    test(`Map Page Should Look Good [${mode}]`, async ({ page, advancedRouteFromHAR, eyes }) => {
      await advancedRouteFromHAR('tests/HAR/realtimemap.har', harOptions)
      await visitPage(page, 'time_based_map_page_title')
      await page.locator('.leaflet-marker-icon').first().waitFor({ state: 'visible' })
      await page.locator('.ant-spin-dot').first().waitFor({ state: 'hidden' })
      await eyes.check('map page')
    })

    test(`Operator Page Should Look Good [${mode}]`, async ({
      page,
      advancedRouteFromHAR,
      eyes,
    }) => {
      await advancedRouteFromHAR('tests/HAR/operator.har', harOptions)
      await visitPage(page, 'operator_title')
      await page
        .getByRole('combobox', { name: i18next.t('choose_operator') })
        .first()
        .click()
      await page.getByRole('option', { name: 'אגד', exact: true }).first().click()
      await waitForSkeletonsToHide(page)
      await eyes.check('operator page', {
        layoutRegions: ['.chart', '.recharts-wrapper'],
      })
    })

    test(`Donation modal Should Look Good [${mode}]`, async ({ page, eyes }) => {
      await page.getByLabel(i18next.t('donate_title')).first().click()
      await page.locator('.MuiTypography-root').first().waitFor()
      await eyes.check('donation modal', {
        region: page.getByRole('dialog').first(),
      })
    })

    test(`Public Appeal Page Should Look Good [${mode}]`, async ({ page, eyes }) => {
      await visitPage(page, 'public_appeal_title')
      await eyes.check('public appeal page')
    })

    test(`Data Research Page Should Look Good [${mode}]`, async ({ page, eyes }) => {
      await page.goto('/data-research')
      await eyes.check('data research page')
    })
  })
}
