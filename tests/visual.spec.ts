import { Eyes, Target, VisualGridRunner } from '@applitools/eyes-playwright'
import username from 'git-username'
import { getBranch, getPastDate, test, waitForSkeletonsToHide } from './utils'

const time = new Date().toLocaleString()
const batchId = process.env.SHA || `${username()}-${time}`
const batchName = process.env.CI
  ? `openbus test branch ${process.env.GITHUB_REF} commit ${process.env.SHA}`
  : `${username()} is testing openbus ${time}`

for (const mode of ['Light', 'Dark', 'LTR']) {
  test.describe(`Visual Tests [${mode}]`, () => {
    const eyes = new Eyes(new VisualGridRunner({ testConcurrency: 20 }), {
      browsersInfo: [
        { width: 1280, height: 720, name: 'chrome' },
        { width: 1280, height: 720, name: 'safari' },
        { width: 375, height: 667, name: 'chrome' },
        { iosDeviceInfo: { deviceName: 'iPhone 16' } },
      ],
    })

    test.beforeAll(async () => {
      eyes.setBatch({ id: batchId, name: batchName })
      await setEyesSettings(eyes)
      if (!process.env.APPLITOOLS_API_KEY) {
        eyes.setIsDisabled(true)
        console.log('APPLITOOLS_API_KEY is not defined, please ask noamgaash for the key')
        test.skip() // on forks, the secret is not available
        return
      }
    })

    test.beforeEach(async ({ page }, testinfo) => {
      await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
      await page.clock.setSystemTime(getPastDate())
      await page.goto('/')
      if (mode === 'Dark') await page.getByLabel('עבור למצב כהה').first().click()
      if (mode === 'LTR') await page.getByLabel('English').first().click()
      if (process.env.APPLITOOLS_API_KEY) {
        await eyes.open(page, 'OpenBus', testinfo.title)
      }
    })

    test.afterEach(async () => {
      try {
        test.setTimeout(0)
        if (process.env.APPLITOOLS_API_KEY) {
          await eyes.close(false)
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
      await eyes.check({
        ...Target.window().layoutRegions(page.getByText('מיקומי אוטובוסים משעה')),
        name: 'map page',
      })
    })

    test(`Operator Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/operator')
      await page.getByRole('combobox', { name: 'חברה מפעילה' }).first().click()
      await page.getByRole('option', { name: 'אגד', exact: true }).first().click()
      await waitForSkeletonsToHide(page)
      await eyes.check({
        ...Target.window().layoutRegions('.chart', '.recharts-wrapper'),
        name: 'operator page',
      })
    })

    test(`Donation modal Should Look Good [${mode}]`, async ({ page }) => {
      await page.getByLabel('לתרומות').first().click()
      await page.locator('.MuiTypography-root').first().waitFor()
      await eyes.check({ ...Target.region(page.getByRole('dialog')), name: 'donation modal' })
    })

    test(`Public Appeal Page Should Look Good [${mode}]`, async ({ page }) => {
      await page.goto('/public-appeal')
      await eyes.check({ ...Target.window(), name: 'public appeal page' })
    })
  })
}

async function setEyesSettings(eyes: Eyes) {
  eyes.getConfiguration().setUseDom(true).setEnablePatterns(true)
  eyes.setParentBranchName('main')
  eyes.setBranchName((await getBranch()) || 'main')
}
