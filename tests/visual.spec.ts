import { Eyes, Target, VisualGridRunner } from '@applitools/eyes-playwright'
import username from 'git-username'
import { getBranch, getPastDate, test, waitForSkeletonsToHide } from './utils'

test.describe('Visual Tests', () => {
  const eyes = new Eyes(new VisualGridRunner(), {
    browsersInfo: [
      { width: 1280, height: 720, name: 'chrome' },
      { width: 1280, height: 720, name: 'safari' },
      { width: 375, height: 667, name: 'chrome' },
      {
        iosDeviceInfo: { deviceName: 'iPhone 16' },
      },
    ],
  })

  test.beforeAll(async () => {
    setBatchName(eyes)
    await setEyesSettings(eyes)
  })

  test.beforeEach(async ({ page }, testinfo) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    await page.clock.setFixedTime(getPastDate())
    if (!process.env.APPLITOOLS_API_KEY) {
      eyes.setIsDisabled(true)
      console.log('APPLITOOLS_API_KEY is not defined, please ask noamgaash for the key')
      test.skip() // on forks, the secret is not available
      return
    }

    await eyes.open(page, 'OpenBus', testinfo.title)
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
  test('Home Page Should Look Good', async ({ page }) => {
    await page.goto('/')
    await eyes.check('home page', Target.window())
  })

  test('Dashboard Page Should Look Good', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByText('אגד').first().waitFor()
    await waitForSkeletonsToHide(page)
    await eyes.check(
      'dashboard page',
      Target.window().layoutRegions('.chart').fully().scrollRootElement('main'),
    )
    // scroll to recharts-wrapper
    await page.evaluate(() => {
      document.querySelector('.recharts-wrapper')?.scrollIntoView()
    })
    await eyes.check('dashboard page - recharts', Target.window().layoutRegions('.chart'))
  })

  test('About Page Should Look Good', async ({ page }) => {
    await page.goto('/about')
    await eyes.check('about page', Target.window())
  })

  test('Timeline Page Should Look Good', async ({ page }) => {
    await page.goto('/timeline')
    await eyes.check('timeline page', Target.window())
  })

  test('Gaps Page Should Look Good', async ({ page }) => {
    await page.goto('/gaps')
    await eyes.check('gaps page', Target.window())
  })

  test('Gaps Patterns Page Should Look Good', async ({ page }) => {
    await page.goto('/gaps_patterns')
    await eyes.check('gaps_patterns page', Target.window())
  })

  test('Map Page Should Look Good', async ({ page }) => {
    await page.goto('/map')
    await page.locator('.leaflet-marker-icon').first().waitFor({ state: 'visible' })
    await page.locator('.ant-spin-dot').first().waitFor({ state: 'hidden' })
    await eyes.check(
      'map page',
      Target.window().layoutRegions(page.getByText('מיקומי אוטובוסים משעה')),
    )
  })

  test('Operator Page Should Look Good', async ({ page }) => {
    await page.goto('/operator')
    await page.getByRole('combobox', { name: 'חברה מפעילה' }).click()
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await waitForSkeletonsToHide(page)
    await eyes.check('operator page', Target.window().layoutRegions('.chart', '.recharts-wrapper'))
  })

  test('Donation modal Should Look Good', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('לתרומות').click()
    await page.locator('.MuiTypography-root').first().waitFor()
    await eyes.check('donation modal', Target.region(page.getByRole('dialog')))
  })
})

function setBatchName(eyes: Eyes) {
  if (process.env.CI) {
    // set batch id to the commit sha
    eyes.setBatch({
      id: process.env.SHA,
      name: 'openbus test branch ' + process.env.GITHUB_REF + ' commit ' + process.env.SHA,
    })
  } else {
    eyes.setBatch(username() + ' is testing openbus ' + new Date().toLocaleString().split(',')[0])
  }
}

async function setEyesSettings(eyes: Eyes) {
  eyes.getConfiguration().setUseDom(true).setEnablePatterns(true)
  eyes.setParentBranchName('main')
  eyes.setBranchName((await getBranch()) || 'main')
}
