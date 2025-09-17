import { Eyes, Target, VisualGridRunner } from '@applitools/eyes-playwright'
import username from 'git-username'
import i18next from 'i18next'
import { getBranch, getPastDate, loadTranslate, test, waitForSkeletonsToHide } from './utils'

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
  test.describe('Visual Tests', () => {
    test.describe.configure({ retries: 0 })
    test.beforeEach(async ({ page }, testinfo) => {
      await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
      await page.route(/.*openstreetmap*/, (route) => route.abort())
      await page.route(/.*youtube*/, (route) => route.abort())
      await page.clock.setSystemTime(getPastDate())
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/')
      if (mode === 'Dark') await page.getByLabel('עבור למצב כהה').first().click()
      if (mode === 'LTR') {
        // Click the language dropdown button (should have "English" text in Hebrew mode)
        await page
          .getByRole('button', { name: /English|Change Language/ })
          .first()
          .click()
        // Click the English option from the dropdown menu (the div, not the button)
        await page.getByText('🇺🇸English').click()
      }
      await loadTranslate(i18next, mode === 'LTR' ? 'en' : 'he')
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

    test(`Dashboard Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/dashboard')
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
      await page.goto('/about')
      await eyes.check({ ...Target.window(), name: 'about page' })
    })

    test(`Timeline Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/timeline')
      await eyes.check({ ...Target.window(), name: 'timeline page' })
    })

    test(`Gaps Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/gaps')
      await eyes.check({ ...Target.window(), name: 'gaps page' })
    })

    test(`Gaps Patterns Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/gaps_patterns')
      await eyes.check({ ...Target.window(), name: 'gaps_patterns page' })
    })

    test(`Map Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/map')
      await page.locator('.leaflet-marker-icon').first().waitFor({ state: 'visible' })
      await page.locator('.ant-spin-dot').first().waitFor({ state: 'hidden' })
      await eyes.check({ ...Target.window(), name: 'map page' })
    })

    test(`Operator Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/operator')
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
      await page.goto('/public-appeal')
      await eyes.check({ ...Target.window(), name: 'public appeal page' })
    })

    test(`Data Research Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/data-research')
      await eyes.check({ ...Target.window(), name: 'data research page' })
    })
  })
}

async function setEyesSettings() {
  const eyes = new Eyes(new VisualGridRunner({ testConcurrency: 10 }), {
    browsersInfo: [
      { width: 1280, height: 720, name: 'chrome' },
      { width: 1280, height: 720, name: 'safari' },
      { chromeEmulationInfo: { deviceName: 'Galaxy S23' } },
      { iosDeviceInfo: { deviceName: 'iPhone 16' } },
    ],
  })

  const time = new Date().toISOString()
  const user = username() || 'unknown-user'
  const batchName = process.env.APPLITOOLS_BATCH_NAME
    ? `${process.env.APPLITOOLS_BATCH_NAME}visual-tests`
    : `${user}-visual-tests-${time}`
  const batchId = process.env.SHA || `${user}-${time}`

  eyes.setBatch({ name: batchName, id: batchId })

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
