import { BatchInfoPlain, Eyes, Target, VisualGridRunner } from '@applitools/eyes-playwright'
import username from 'git-username'
import i18next from 'i18next'
import dayjs from 'src/dayjs'
import { getBranch, harOptions, setupTest, test, visitPage, waitForSkeletonsToHide } from './utils'

const eyes = await setEyesSettings()
test.beforeAll(() => {
  if (!process.env.APPLITOOLS_API_KEY) {
    eyes.setIsDisabled(true)
    console.log('APPLITOOLS_API_KEY is not defined, please ask noamgaash for the key')
    test.skip() // on forks, the secret is not available
    return
  }
})

for (const mode of ['Light', 'Dark', 'LTR']) {
  test.describe(`Visual Tests - ${mode}`, () => {
    test.describe.configure({ retries: 0 })
    test.beforeAll(() => {
      eyes.setBatch(setBatchSettings(mode.toLocaleLowerCase()))
    })

    test.beforeEach(async ({ page }, testinfo) => {
      await page.route(/.*youtube*/, (route) => route.abort())
      await setupTest(page, mode === 'LTR' ? 'en' : 'he')
      if (mode === 'Dark') {
        await page.getByLabel('עבור למצב כהה').first().click()
      }
      if (mode === 'LTR') {
        await page.getByRole('button', { name: 'החלף שפה' }).first().click()
        await page.getByRole('menuitem').filter({ hasText: 'English' }).click()
      }
      if (process.env.APPLITOOLS_API_KEY) {
        await eyes.open(page, 'OpenBus', testinfo.title)
      }
    })

    test.afterEach(async () => {
      try {
        test.setTimeout(0)
        if (process.env.APPLITOOLS_API_KEY) {
          await eyes.close()
        }
      } catch (e) {
        console.error(e)
      }
    })

    test(`Home Page Should Look Good [${mode}]`, async () => {
      await eyes.check({ ...Target.window(), name: 'home page' })
    })

    test(`Dashboard Page Should Look Good [${mode}]`, async ({ page, advancedRouteFromHAR }) => {
      await advancedRouteFromHAR('tests/HAR/dashboard.har', harOptions)
      await visitPage(page, 'dashboard_page_title')
      await page.getByText('אגד').first().waitFor()
      await waitForSkeletonsToHide(page)
      await eyes.check({
        ...Target.window().layoutRegions('.chart').fully().scrollRootElement('main'),
        name: 'dashboard page',
      })
      // scroll to recharts-wrapper
      await page.evaluate(() => {
        document.querySelector('.recharts-wrapper')?.scrollIntoView()
      })
      await eyes.check({
        ...Target.window().layoutRegions('.chart'),
        name: 'dashboard page - recharts',
      })
    })

    test(`About Page Should Look Good [${mode}]`, async ({ page }) => {
      await visitPage(page, 'about_title')
      await eyes.check({ ...Target.window(), name: 'about page' })
    })

    test(`Timeline Page Should Look Good [${mode}]`, async ({ page, advancedRouteFromHAR }) => {
      await advancedRouteFromHAR('tests/HAR/timeline.har', harOptions)
      await visitPage(page, 'timeline_page_title')
      await eyes.check({ ...Target.window(), name: 'timeline page' })
    })

    test(`Gaps Page Should Look Good [${mode}]`, async ({ page, advancedRouteFromHAR }) => {
      await advancedRouteFromHAR('tests/HAR/missing.har', harOptions)
      await visitPage(page, 'gaps_page_title')
      await eyes.check({ ...Target.window(), name: 'gaps page' })
    })

    test(`Gaps Patterns Page Should Look Good [${mode}]`, async ({
      page,
      advancedRouteFromHAR,
    }) => {
      await advancedRouteFromHAR('tests/HAR/patterns.har', harOptions)
      await visitPage(page, 'gaps_patterns_page_title')
      await eyes.check({ ...Target.window(), name: 'gaps_patterns page' })
    })

    test(`Map Page Should Look Good [${mode}]`, async ({ page, advancedRouteFromHAR }) => {
      await advancedRouteFromHAR('tests/HAR/realtimemap.har', harOptions)
      await visitPage(page, 'time_based_map_page_title')
      await page.locator('.leaflet-marker-icon').first().waitFor({ state: 'visible' })
      await page.locator('.ant-spin-dot').first().waitFor({ state: 'hidden' })
      await eyes.check({ ...Target.window(), name: 'map page' })
    })

    test(`Operator Page Should Look Good [${mode}]`, async ({ page, advancedRouteFromHAR }) => {
      await advancedRouteFromHAR('tests/HAR/operator.har', harOptions)
      await visitPage(page, 'operator_title')
      await page
        .getByRole('combobox', { name: i18next.t('choose_operator') })
        .first()
        .click()
      await page.getByRole('option', { name: 'אגד', exact: true }).first().click()
      await waitForSkeletonsToHide(page)
      await eyes.check({
        ...Target.window().layoutRegions('.chart', '.recharts-wrapper'),
        name: 'operator page',
      })
    })

    test(`Donation modal Should Look Good [${mode}]`, async ({ page }) => {
      await page.getByLabel(i18next.t('donate_title')).first().click()
      await page.locator('.MuiTypography-root').first().waitFor()
      await eyes.check({ ...Target.region(page.getByRole('dialog')), name: 'donation modal' })
    })

    test(`Public Appeal Page Should Look Good [${mode}]`, async ({ page }) => {
      await visitPage(page, 'public_appeal_title')
      await eyes.check({ ...Target.window(), name: 'public appeal page' })
    })

    test(`Data Research Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/data-research')
      await eyes.check({ ...Target.window(), name: 'data research page' })
    })
  })
}

const time = dayjs().startOf('minute').toISOString()
const user = username() || 'unknown-user'

function setBatchSettings(mode: string): BatchInfoPlain {
  return {
    name: process.env.APPLITOOLS_BATCH_NAME
      ? `${process.env.APPLITOOLS_BATCH_NAME}visual-tests-${mode.toLowerCase()}`
      : `${user}-visual-tests-${mode.toLowerCase()}-${time}`,
    id: process.env.SHA || `${user}-${mode.toLowerCase()}-${time}`,
  }
}

async function setEyesSettings() {
  const eyes = new Eyes(new VisualGridRunner({ testConcurrency: 10 }), {
    browsersInfo: [
      { width: 1280, height: 720, name: 'chrome' },
      { width: 1280, height: 720, name: 'safari' },
      { chromeEmulationInfo: { deviceName: 'Galaxy S23' } },
      { iosDeviceInfo: { deviceName: 'iPhone 16' } },
    ],
    dontCloseBatches: !!process.env.CI,
  })

  const config = eyes.getConfiguration()
  config.setUseDom(true)
  config.setEnablePatterns(true)
  eyes.setConfiguration(config)
  eyes.setParentBranchName('main')

  try {
    const branch = (await getBranch()) || 'main'
    eyes.setBranchName(branch)
  } catch {
    eyes.setBranchName('main')
  } finally {
    return eyes
  }
}
