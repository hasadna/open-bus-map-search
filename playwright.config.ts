import { EyesFixture } from '@applitools/eyes-playwright/fixture'
import { defineConfig, devices } from '@playwright/test'
import username from 'git-username'
import { getBranch } from 'tests/utils'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<EyesFixture>({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry twice on CI. */
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 3 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html']],
  timeout: 3 * 60 * 1000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'on' : 'on-all-retries',

    timezoneId: 'Asia/Jerusalem',

    /* Block service workers so they don't intercept stride-api fetch() calls,
       bypassing page.route() handlers (which would break HAR-based mocking in CI). */
    serviceWorkers: 'block',

    eyesConfig: {
      type: 'ufg',
      isDisabled: !process.env.APPLITOOLS_API_KEY,
      failTestsOnDiff: false,
      batch: {
        name: process.env.APPLITOOLS_BATCH_NAME ?? `Visual Tests - ${username()}`,
        id: process.env.APPLITOOLS_BATCH_ID,
      },
      browsersInfo: [
        { width: 1280, height: 720, name: 'chrome' },
        { width: 1280, height: 720, name: 'safari' },
        { chromeEmulationInfo: { deviceName: 'Galaxy S23' } },
        { iosDeviceInfo: { deviceName: 'iPhone 16' } },
      ],
      branchName: await getBranch(),
      parentBranchName: 'main',
    },
  },
  expect: {
    timeout: 5000,
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm start',
    reuseExistingServer: true,
    timeout: 120 * 1000,
    port: 3000,
  },
})
