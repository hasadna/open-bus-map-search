import { Eyes, Target, VisualGridRunner } from '@applitools/eyes-playwright'
import username from 'git-username'
import { getBranch, test } from './utils'

test.describe('Visual Tests', () => {
  const eyes = new Eyes(new VisualGridRunner(), {
    browsersInfo: [
      { width: 1280, height: 720, name: 'chrome' },
      { width: 1280, height: 720, name: 'safari' },
      { width: 375, height: 667, name: 'chrome' },
      {
        iosDeviceInfo: { deviceName: 'iPhone 8' },
      },
    ],
  })
  test.beforeAll(async () => {
    setBatchName(eyes)
    await setEyesSettings(eyes)
  })

  test.beforeEach(async ({ page }, testinfo) => {
    if (!process.env.APPLITOOLS_API_KEY) {
      eyes.setIsDisabled(true)
      console.log('APPLITOOLS_API_KEY is not defined, please ask noamgaash for the key')
      test.skip() // on forks, the secret is not available
      return
    }

    await eyes.open(page, 'OpenBus', testinfo.title)
  })

  test.afterEach(async () => {
    await eyes.close(false)
  })

  test('dashboard page should look good', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByText('אגד').first().waitFor()
    while ((await page.locator('.ant-skeleton-content').count()) > 0)
      await page.locator('.ant-skeleton-content').last().waitFor({ state: 'hidden' })
    await eyes.check(
      'dashboard page',
      Target.window()
        .layoutRegions('.chart', page.getByPlaceholder('DD/MM/YYYY'))
        .fully()
        .scrollRootElement('main'),
    )
    // scroll to recharts-wrapper
    await page.evaluate(() => {
      document.querySelector('.recharts-wrapper')?.scrollIntoView()
    })
    await eyes.check(
      'dashboard page - recharts',
      Target.window().layoutRegions('.chart', page.getByPlaceholder('DD/MM/YYYY')),
    )
  })

  test('front page should look good', async ({ page }) => {
    await page.goto('/')
    await eyes.check('front page', Target.window())
  })

  test('about page should look good', async ({ page }) => {
    await page.goto('/about')
    await eyes.check('about page', Target.window())
  })

  test('timeline page should look good', async ({ page }) => {
    await page.goto('/timeline')
    await eyes.check(
      'timeline page',
      Target.window().layoutRegion(page.getByPlaceholder('DD/MM/YYYY')),
    )
  })

  test('gaps page should look good', async ({ page }) => {
    await page.goto('/gaps')
    await eyes.check('gaps page', Target.window().layoutRegion(page.getByPlaceholder('DD/MM/YYYY')))
  })

  test('gaps_patterns page should look good', async ({ page }) => {
    await page.goto('/gaps_patterns')
    await eyes.check(
      'gaps_patterns page',
      Target.window().layoutRegion(page.getByPlaceholder('DD/MM/YYYY')),
    )
  })

  test('map page should look good', async ({ page }) => {
    await page.goto('/map')
    try {
      await page.locator('.leaflet-marker-icon').first().waitFor({ state: 'visible' })
      await page.locator('.ant-spin-dot').first().waitFor({ state: 'hidden' })
    } catch (error) {
      console.warn('map page failed to load in a reasonable time')
    }
    await eyes.check(
      'map page',
      Target.window().layoutRegions(
        page.getByPlaceholder('DD/MM/YYYY'),
        page.getByText('מיקומי אוטובוסים משעה'),
      ),
    )
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
